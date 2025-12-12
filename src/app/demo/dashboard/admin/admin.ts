import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'ใช้งาน' | 'ซ่อน';
}
interface Order {
  orderId: string;
  customerName: string;
  date: string;
  total: number;
  status: 'ใหม่' | 'กำลังจัดส่ง' | 'สำเร็จ' | 'ยกเลิก';
}
interface Employee {
  empId: string;
  name: string;
  position: 'Admin' | 'พนักงานคลังสินค้า' | 'พนักงานขาย';
  hireDate: string;
  status: 'ใช้งาน' | 'ลาออก';
  email: string;
}
interface Customer {
  custId: number;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  lastActive: string;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  currentPage: 'dashboard' | 'products' | 'orders' | 'settings' | 'employees' | 'customers' = 'dashboard';

  dashboardStats = [
    { title: 'ยอดขายรวมวันนี้', value: '฿ 12,500.00', trend: '+5.2%', trendClass: 'up', icon: 'money' },
    { title: 'คำสั่งซื้อใหม่ (รอจัดส่ง)', value: '15 รายการ', trend: 'เพิ่มขึ้น 2 รายการ', trendClass: 'normal', icon: 'box' },
    { title: 'ลูกค้าใหม่สัปดาห์นี้', value: '45 ราย', trend: 'ต้อนรับลูกค้าใหม่', trendClass: 'up', icon: 'group' },
    { title: 'สินค้าใกล้หมด', value: '7 รายการ', trend: 'โปรดเติมสินค้า', trendClass: 'down', icon: 'warning' },
  ];
  products: Product[] = [
    { id: 101, name: 'Royal Canin Kitten 2KG', category: 'อาหารแมว', price: 650, stock: 55, status: 'ใช้งาน' },
    { id: 102, name: 'SmartHeart Dog Food 10KG', category: 'อาหารสุนัข', price: 890, stock: 12, status: 'ใช้งาน' },
    { id: 103, name: 'Whiskas Pouch Tuna Set', category: 'อาหารเปียก', price: 499, stock: 0, status: 'ซ่อน' },
    { id: 104, name: 'Pedigree Adult 3KG', category: 'อาหารสุนัข', price: 350, stock: 150, status: 'ใช้งาน' },
    { id: 105, name: 'Cat Toy Mouse Set', category: 'ของเล่น', price: 150, stock: 5, status: 'ใช้งาน' },
  ];
  orders: Order[] = [
    { orderId: 'ORD001', customerName: 'คุณสมศักดิ์', date: '08/12/2568', total: 1250.00, status: 'ใหม่' },
    { orderId: 'ORD002', customerName: 'คุณอรทัย', date: '07/12/2568', total: 699.50, status: 'กำลังจัดส่ง' },
    { orderId: 'ORD003', customerName: 'คุณธนพล', date: '05/12/2568', total: 4500.00, status: 'สำเร็จ' },
    { orderId: 'ORD004', customerName: 'คุณจิราพร', date: '05/12/2568', total: 300.00, status: 'ยกเลิก' },
  ];
  employees: Employee[] = [
    { empId: 'E001', name: 'มาลี ใจดี', position: 'Admin', hireDate: '01/01/2565', status: 'ใช้งาน', email: 'malee@petfood.com' },
    { empId: 'E002', name: 'สมบัติ ขยัน', position: 'พนักงานคลังสินค้า', hireDate: '15/03/2566', status: 'ใช้งาน', email: 'sombat@petfood.com' },
    { empId: 'E003', name: 'วิมล รักสัตว์', position: 'พนักงานขาย', hireDate: '10/05/2567', status: 'ใช้งาน', email: 'wimon@petfood.com' },
    { empId: 'E004', name: 'ชาญชัย อดทน', position: 'พนักงานคลังสินค้า', hireDate: '20/12/2564', status: 'ลาออก', email: 'charnchai@petfood.com' },
  ];
  customers: Customer[] = [
    { custId: 1, name: 'สมศักดิ์ รักหมา', email: 'somsak@mail.com', phone: '081-123-xxxx', totalOrders: 15, lastActive: '08/12/2568' },
    { custId: 2, name: 'อรทัย ชอบแมว', email: 'oratai@mail.com', phone: '082-456-xxxx', totalOrders: 5, lastActive: '07/12/2568' },
    { custId: 3, name: 'ธนพล ใจป้ำ', email: 'thanapol@mail.com', phone: '083-789-xxxx', totalOrders: 3, lastActive: '05/12/2568' },
  ];

  constructor() { }

  ngOnInit(): void {
    console.log()
  }
  setPage(page: 'dashboard' | 'products' | 'orders' | 'settings' | 'employees' | 'customers'): void {
    this.currentPage = page;
  }
  mockAction(action: string, data: Product | Order | Employee | Customer): void {
    let idValue: number | string;
    if ('id' in data) {
      idValue = data.id;
    } else if ('orderId' in data) {
      idValue = data.orderId;
    } else if ('empId' in data) {
      idValue = data.empId;
    } else {
      idValue = (data as Customer).custId;
    }
    alert(`${action} ข้อมูล: ID ${idValue}`);
  }
}
