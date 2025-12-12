import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface Order {
  orderId: string;
  customerName: string;
  date: string;
  total: number;
  status: 'ใหม่' | 'กำลังจัดส่ง' | 'สำเร็จ' | 'ยกเลิก';
  isPaid: boolean;
  items: OrderItem[];
}
interface OrderItem {
  itemId: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
}
interface Employee {
  empId: string;
  name: string;
  position: 'Admin' | 'พนักงานคลังสินค้า' | 'พนักงานขาย';
  hireDate: string;
  status: 'ใช้งาน' | 'ลาออก';
  email: string;
  phone: string;
  address: string;
  role: 'SystemAdmin' | 'InventoryStaff' | 'SalesStaff';
  passwordHash: string;
  salary: number;
}

@Component({
  selector: 'app-staff',
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './staff.html',
  styleUrl: './staff.scss'
})
export class Staff implements OnInit {
  selectedOrder: Order | null = null;
  currentStaff: Employee = {
    empId: 'E002',
    name: 'สมบัติ ขยัน',
    position: 'พนักงานคลังสินค้า',
    hireDate: '15/03/2566',
    status: 'ใช้งาน',
    email: 'sombat@petfood.com',
    phone: '081-456-7890',
    address: '99/22 ถ.ลาดพร้าว แขวงจอมพล กรุงเทพฯ',
    role: 'InventoryStaff',
    passwordHash: 'e10adc3949ba59abbe56e057f20f883e',
    salary: 18000
  };

  allOrders: Order[] = [
    {
      orderId: 'ORD001',
      customerName: 'คุณสมศักดิ์',
      date: '08/12/2568',
      total: 1250.0,
      status: 'ใหม่',
      isPaid: true,
      items: [
        { itemId: 101, productName: 'Royal Canin Kitten 2KG', quantity: 1, pricePerUnit: 650 },
        { itemId: 104, productName: 'Pedigree Adult 3KG', quantity: 2, pricePerUnit: 300 }
      ]
    },
    {
      orderId: 'ORD002',
      customerName: 'คุณอรทัย',
      date: '07/12/2568',
      total: 699.5,
      status: 'กำลังจัดส่ง',
      isPaid: true,
      items: [{ itemId: 102, productName: 'SmartHeart Dog Food 10KG', quantity: 1, pricePerUnit: 699.5 }]
    },
    {
      orderId: 'ORD006',
      customerName: 'คุณวิรัตน์',
      date: '09/12/2568',
      total: 1500.0,
      status: 'ใหม่',
      isPaid: true,
      items: [
        { itemId: 101, productName: 'Royal Canin Kitten 2KG', quantity: 2, pricePerUnit: 650 },
        { itemId: 105, productName: 'Cat Toy Mouse Set', quantity: 1, pricePerUnit: 200 }
      ]
    }
  ];
  viewOrderDetails(order: Order): void {
    if (this.selectedOrder === order) {
      this.selectedOrder = null;
    } else {
      this.selectedOrder = order;
    }
  }
  ordersForShipping: Order[] = [];

  constructor() {}
  editStaffInfo(): void {
    alert(`กำลังเข้าสู่หน้าฟอร์มแก้ไขข้อมูลของพนักงาน ${this.currentStaff.name}`);
  }
  ngOnInit(): void {
    this.loadOrdersForShipping();
    console.log(`พนักงาน ${this.currentStaff.name} เข้าสู่ระบบแล้ว (3.1)`);
  }
  loadOrdersForShipping(): void {
    this.ordersForShipping = this.allOrders
      .filter((order) => order.status === 'ใหม่' && order.isPaid)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  mockOrderAction(order: Order, action: 'จัดส่ง' | 'สำเร็จ'): void {
    alert(`ดำเนินการ: ${action} รหัสสั่งซื้อ ${order.orderId}`);
  }
}
