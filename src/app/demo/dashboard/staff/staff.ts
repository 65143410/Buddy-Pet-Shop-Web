import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { Order, Staff as Employee } from '../../models/product.model';
import { StaffApiService } from 'src/app/services/StaffApiService';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './staff.html',
  styleUrl: './staff.scss'
})
export class Staff implements OnInit {
  private staffApiService = inject(StaffApiService);

  selectedOrder: Order | null = null;

  currentStaff!: Employee;
  allOrders: Order[] = [];
  ordersForShipping: Order[] = [];
  myPreparingTasks: Order[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadStaffProfile(1);
    this.loadInitialData();
  }

  loadStaffProfile(id: number): void {
    this.staffApiService.getAllStaff().subscribe({
      next: (staffs) => {
        this.currentStaff = staffs.find((s) => s.staffId === id)!;
        console.log(`พนักงาน ${this.currentStaff?.name} เข้าสู่ระบบแล้ว`);
      }
    });
  }

  loadInitialData(): void {
    this.staffApiService.getAllOrders().subscribe({
      next: (data) => {
        this.allOrders = data;
        this.loadOrdersForShipping();
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  loadOrdersForShipping(): void {
    // 1. New Orders (Paid but no staff assigned)
    this.ordersForShipping = this.allOrders
      .filter((order) => order.status.statusName === 'ชำระเงินแล้ว' && !order.staff)
      .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());

    // 2. My Tasks (Assigned to me and Preparing)
    this.myPreparingTasks = this.allOrders
      .filter((order) =>
        order.staff?.staffId === this.currentStaff.staffId &&
        order.status.statusName === 'กำลังจัดเตรียมสินค้า'
      )
      .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
  }

  pickupOrder(order: Order): void {
    if (confirm(`ยืนยันการรับออเดอร์ #${order.orderId} เพื่อเตรียมจัดส่ง?`)) {
      this.staffApiService.acceptOrder(order.orderId, this.currentStaff.staffId).subscribe({
        next: () => {
          alert(`รับออเดอร์ #${order.orderId} เรียบร้อยแล้ว`);
          this.selectedOrder = null;
          this.loadInitialData();
        },
        error: (err) => alert('ไม่สามารถรับออเดอร์ได้: ' + (err.error?.message || err.error))
      });
    }
  }

  shipOrder(order: Order): void {
    if (confirm(`ยืนยันว่าจัดเตรียมสินค้า #${order.orderId} เสร็จสิ้นและส่งแล้ว?`)) {
      this.staffApiService.completeOrder(order.orderId).subscribe({
        next: () => {
          alert(`อัปเดตออเดอร์ #${order.orderId} เป็นจัดส่งแล้ว`);
          this.selectedOrder = null;
          this.loadInitialData();
        },
        error: (err) => alert('ไม่สามารถอัปเดตสถานะได้: ' + (err.error?.message || err.error))
      });
    }
  }

  mockOrderAction(order: Order, action: 'จัดส่ง' | 'สำเร็จ'): void {
    if (action === 'จัดส่ง') {
      this.staffApiService.acceptOrder(order.orderId, this.currentStaff.staffId).subscribe({
        next: () => {
          alert(`รับออเดอร์ #${order.orderId} เข้าสู่กระบวนการเตรียมจัดส่งแล้ว`);
          this.loadInitialData();
        },
        error: (err) => alert('ไม่สามารถรับออเดอร์ได้: ' + err.error)
      });
    }
  }

  viewOrderDetails(order: Order, _table: string = ''): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
}
