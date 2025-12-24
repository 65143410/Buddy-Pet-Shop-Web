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

  isToggleLogisTable = false;
  isToggleOrderTable = false;
  selectedOrder: Order | null = null;

  currentStaff!: Employee;
  allOrders: Order[] = [];
  ordersForShipping: Order[] = [];

  constructor() {}

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
    this.ordersForShipping = this.allOrders
      .filter((order) => order.status.statusName === 'ชำระเงินแล้ว')
      .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
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

  viewOrderDetails(order: Order, table: string): void {
    if (this.selectedOrder === order) {
      this.selectedOrder = null;
      this.isToggleLogisTable = false;
      this.isToggleOrderTable = false;
    } else {
      this.selectedOrder = order;
      this.isToggleLogisTable = table === 'logis';
      this.isToggleOrderTable = table === 'order';
    }
  }
}
