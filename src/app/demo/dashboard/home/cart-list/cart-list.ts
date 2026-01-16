import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router
import { CartProduct } from 'src/app/demo/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service'; // Import OrderService

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-list.html',
  styleUrls: ['./cart-list.scss']
})
export class CartList implements OnInit {
  count: number = 0;
  isOpen: boolean = false;

  // Steps Flags
  previewFlag: boolean = false;
  addressFlag: boolean = false;
  paymentFlag: boolean = false;

  inVoiceNo: number | undefined;
  totalAmount: number = 0;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  shippingAddress: string = '';
  currentUser: any = null;

  cartService = inject(CartService);
  private router = inject(Router); // Inject Router
  private orderService = inject(OrderService); // Inject OrderService

  constructor() { }

  ngOnInit() {
    this.cartService.cartUpdates$.subscribe(() => {
      this.updateCartData();
    });
    this.updateCartData();
  }

  private updateCartData(): void {
    this.count = this.cartService.count;
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalAmount = this.cartService.cartItems.reduce((acc, item) => {
      const qty = item.qty || 0;
      const price = item.price || 0;
      return acc + price * qty;
    }, 0);
  }

  openCart(): void {
    this.isOpen = true;
    this.resetFlags();
    this.calculateTotal();
  }

  closeCart(): void {
    this.isOpen = false;
    this.resetFlags();
  }

  resetFlags() {
    this.previewFlag = false;
    this.addressFlag = false;
    this.paymentFlag = false;
    this.imagePreview = null;
    this.selectedFile = null;
  }

  removeProduct(item: CartProduct): void {
    this.cartService.remove(item.productId);
  }

  chngQuantity(): void {
    this.updateCartData();
  }

  // Step 1: Check Login -> Go to Preview
  checkout(): void {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      this.closeCart();
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = JSON.parse(userJson);
    this.previewFlag = true;
    this.inVoiceNo = this.getRandomInt(100000, 999999);
    this.calculateTotal();
  }

  // Step 2: Confirm Items -> Go to Address
  confirmItems(): void {
    this.addressFlag = true;
    this.previewFlag = false;
    // Pre-fill address from profile if available
    this.shippingAddress = this.currentUser.address || '';
  }

  // Step 3: Confirm Address -> Go to Payment
  confirmAddress(): void {
    if (!this.shippingAddress || this.shippingAddress.trim() === '') {
      alert('กรุณาระบุที่อยู่จัดส่ง');
      return;
    }
    this.addressFlag = false;
    this.paymentFlag = true;
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submitPayment(): void {
    if (!this.selectedFile) {
      alert('กรุณาอัปโหลดสลิปหลักฐานการโอนเงิน');
      return;
    }

    const orderData = {
      order: {
        customer: { customerId: this.currentUser.customerId }, // Correct: Nested object
        // orderDate: new Date(), // Remove: Let backend handle LocalDate
        totalAmount: this.totalAmount,
        status: { statusId: 2 }, // 2 = รอตรวจสอบ
        address: this.shippingAddress,
        invoiceNo: 'INV-' + this.inVoiceNo
      },
      details: this.cartService.cartItems.map(item => ({
        product: { productId: item.productId },
        quantity: item.qty,
        unitPrice: item.price // Correct: Match entity field name
      })),
      slipImage: this.imagePreview
    };

    console.log('Creating Order with Slip (Base64):', orderData);

    // Call service with JSON object (no FormData)
    this.orderService.createOrderWithSlip(orderData).subscribe({
      next: (res) => {
        alert('สั่งซื้อและแจ้งชำระเงินสำเร็จ! ขอบคุณที่ใช้บริการครับ');
        this.cartService.clearCart();
        this.closeCart();
      },
      error: (err) => {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + (err.error?.message || err.message));
      }
    });

  }
  goBack() {
    if (this.paymentFlag) {
      this.paymentFlag = false;
      this.addressFlag = true;
    } else if (this.addressFlag) {
      this.addressFlag = false;
      this.previewFlag = true;
    } else {
      this.previewFlag = false;
    }
  }
}
