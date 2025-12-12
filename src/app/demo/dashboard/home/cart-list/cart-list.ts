import { Component, inject, OnInit } from '@angular/core';
import { CartService } from './../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// แนะนำให้กำหนด Interface ของ CartItem เพื่อให้ TypeScript ทำงานได้ดีขึ้น
interface CartItem {
  id: number; // ควรกำหนดประเภท ID ที่ชัดเจน
  name: string;
  price: number;
  qty: number;
}


@Component({
  selector: 'app-cart-list',
    imports: [CommonModule,FormsModule],
  templateUrl: './cart-list.html',
  styleUrls: ['./cart-list.scss']
})
export class CartList implements OnInit {
  count: number = 0;
  isOpen: boolean = false;
  previewFlag: boolean = false;
  inVoiceNo: number | undefined; // อาจเป็น undefined ก่อนสร้าง
  cartService = inject(CartService);

  constructor() {}

  ngOnInit() {
    this.cartService.cartUpdates$.subscribe(() => {
      this.count = this.cartService.count;
    });
    // ตั้งค่า count เริ่มต้น
    this.count = this.cartService.count;
  }

  openCart(): void {
    this.isOpen = true;
    console.log(this.isOpen)
  }

  closeCart(): void {
    this.isOpen = false;
    this.previewFlag = false;
  }

  // **แก้ไข:** เพิ่มการตรวจสอบ index ก่อนการลบ
  removeProduct(item: CartItem): void {
    const index = this.cartService.cartItems.findIndex((element: CartItem) => item.id === element.id);
    
    // ตรวจสอบว่าพบ Element ในอาร์เรย์หรือไม่
    if (index > -1) {
        this.cartService.cartItems.splice(index, 1);
        // อัปเดตจำนวนรวมหลังจากลบ
        this.count = this.cartService.count; 
    } else {
        console.warn('Product not found in cart:', item);
    }
  }

  chngQuantity(): void {
    // ถูกเรียกเมื่อมีการเปลี่ยนแปลงค่าใน input จำนวนสินค้า
    // service ควรรับผิดชอบในการคำนวณ count ใหม่
    this.count = this.cartService.count;
  }

  preview(): void {
    this.previewFlag = true;
    this.inVoiceNo = this.getRandomInt(23443, 23432555);
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}