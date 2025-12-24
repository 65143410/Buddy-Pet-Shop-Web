import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartProduct } from 'src/app/demo/models/product.model';
import { CartService } from 'src/app/services/cart.service';

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
  previewFlag: boolean = false;
  paymentFlag: boolean = false;
  inVoiceNo: number | undefined;
  totalAmount: number = 0;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  cartService = inject(CartService);

  constructor() {}

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
    this.previewFlag = false;
    this.paymentFlag = false;
    this.calculateTotal();
  }

  closeCart(): void {
    this.isOpen = false;
    this.previewFlag = false;
    this.paymentFlag = false;
  }

  removeProduct(item: CartProduct): void {
    this.cartService.remove(item.productId);
  }

  chngQuantity(): void {
    this.updateCartData();
  }

  preview(): void {
    this.previewFlag = true;
    this.inVoiceNo = this.getRandomInt(23443, 23432555);
    this.calculateTotal();
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  confirmOrder(): void {
    this.paymentFlag = true;
    this.previewFlag = false;
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
    alert('กรุณาอัปโหลดสลิปการโอนเงิน');
    return;
  }
  console.log('Sending slip for Invoice:', this.inVoiceNo);
  alert('ส่งหลักฐานการชำระเงินเรียบร้อย!');
  this.cartService.clearCart();
  this.closeCart();
  this.paymentFlag = false;
  this.imagePreview = null;
  this.selectedFile = null;
}
}
