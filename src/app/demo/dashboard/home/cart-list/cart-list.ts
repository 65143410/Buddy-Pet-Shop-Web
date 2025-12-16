import { Component, inject, OnInit } from '@angular/core';
import { CartService } from './../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// ต้องติดตั้ง library สำหรับไอคอน เช่น Font Awesome ในโปรเจกต์
// ในโค้ดนี้ใช้ไอคอน Font Awesome (fas)
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

@Component({
  selector: 'app-cart-list',
  standalone: true, // เพิ่ม standalone: true หากใช้ Angular Standalone Components
  imports: [CommonModule, FormsModule /*, FontAwesomeModule */],
  templateUrl: './cart-list.html',
  styleUrls: ['./cart-list.scss']
})
export class CartList implements OnInit {
  count: number = 0;
  isOpen: boolean = false;
  previewFlag: boolean = false;
  inVoiceNo: number | undefined;
  totalAmount: number = 0; // ตัวแปรสำหรับราคารวมทั้งหมด
  cartService = inject(CartService);

  constructor() {}

  ngOnInit() {
    this.cartService.cartUpdates$.subscribe(() => {
      this.count = this.cartService.count;
      this.calculateTotal(); // อัปเดตราคารวมเมื่อมีการเปลี่ยนแปลง
    });
    this.count = this.cartService.count;
    this.calculateTotal();
  }

  // คำนวณราคารวม
  calculateTotal(): void {
    this.totalAmount = this.cartService.cartItems.reduce((acc, item) => {
      const qty = item.qty || 0;
      const price = item.price || 0;
      return acc + (price * qty);
    }, 0);
  }

  openCart(): void {
    this.isOpen = true;
    this.previewFlag = false;
    this.calculateTotal(); // คำนวณราคารวมก่อนเปิดตะกร้า
  }

  closeCart(): void {
    this.isOpen = false;
    this.previewFlag = false;
  }

  removeProduct(item: CartItem): void {
    const index = this.cartService.cartItems.findIndex((element: CartItem) => item.id === element.id);
    if (index > -1) {
      this.cartService.cartItems.splice(index, 1);

      // อัปเดต count จาก Service หรือคำนวณใหม่
      // สมมติว่า cartService.count ถูกอัปเดตใน Service
      // หาก service ไม่ได้อัปเดต count, ควรเรียก method ใน service ที่อัปเดต
      this.count = this.cartService.count;
      this.calculateTotal();
    } else {
      console.warn('Product not found in cart:', item);
    }
  }

  chngQuantity(): void {
    // อัปเดต count จาก Service
    this.count = this.cartService.count;
    this.calculateTotal(); // คำนวณราคารวมใหม่เมื่อจำนวนเปลี่ยน
  }

  preview(): void {
    this.previewFlag = true;
    this.inVoiceNo = this.getRandomInt(23443, 23432555);
    this.calculateTotal(); // ตรวจสอบราคารวมอีกครั้ง
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
