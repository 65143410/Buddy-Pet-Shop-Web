import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { Order, Staff as Employee } from '../../models/product.model';
import { StaffApiService } from 'src/app/services/StaffApiService';
import { UserService } from 'src/app/services/user.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './staff.html',
  styleUrl: './staff.scss'
})
export class Staff implements OnInit {
  private staffApiService = inject(StaffApiService);
  private userService = inject(UserService);

  selectedOrder: Order | null = null;

  currentStaff!: Employee;
  allOrders: Order[] = [];
  ordersForShipping: Order[] = [];
  myPreparingTasks: Order[] = [];

  // Pagination for Shipping Orders
  shippingCurrentPage: number = 1;
  pageSize: number = 10;

  // Pagination for All Orders
  allOrdersCurrentPage: number = 1;

  constructor() { }

  ngOnInit(): void {
    const user: any = this.userService.getCurrentUserValue();
    if (user && user.staffId) {
      this.loadStaffProfile(user.staffId);
    } else if (user && user.adminId) {
      this.loadStaffProfile(user.adminId); // Admins can also access staff view
    } else {
      console.warn('No staff/admin user found in session, using fallback ID');
      this.loadStaffProfile(1); // Keep fallback or handle guest
    }
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
        this.allOrders = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        this.loadOrdersForShipping();
        // Keep current pages unless the data length makes them invalid
        if (this.shippingCurrentPage > this.shippingTotalPages) this.shippingCurrentPage = Math.max(1, this.shippingTotalPages);
        if (this.allOrdersCurrentPage > this.allOrdersTotalPages) this.allOrdersCurrentPage = Math.max(1, this.allOrdersTotalPages);
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  loadOrdersForShipping(): void {
    this.ordersForShipping = this.allOrders
      .filter((order) => order.status.statusName === 'ชำระเงินแล้ว' && !order.staff)
      .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());

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
    if (!order.trackingNumber || !order.trackingNumber.trim()) {
      alert('กรุณากรอกหมายเลข Tracking Number ก่อนยืนยันการจัดส่ง');
      return;
    }

    if (confirm(`ยืนยันว่าจัดเตรียมสินค้า #${order.orderId} เสร็จสิ้นและส่งแล้ว?`)) {
      // First update shipping info (tracking number)
      this.staffApiService.updateOrderShippingInfo(order.orderId, order.trackingNumber, order.shippingCost || 0).subscribe({
        next: () => {
          // Then mark as complete
          this.staffApiService.completeOrder(order.orderId).subscribe({
            next: () => {
              alert(`อัปเดตออเดอร์ #${order.orderId} เป็นจัดส่งแล้วเรียบร้อย`);
              this.selectedOrder = null;
              this.loadInitialData();
            },
            error: (err) => alert('ไม่สามารถอัปเดตสถานะเป็นจัดส่งได้: ' + (err.error?.message || err.error))
          });
        },
        error: (err) => alert('ไม่สามารถบันทึกเลข Tracking ได้: ' + (err.error?.message || err.error))
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

  // Pagination Getters & Methods
  get shippedOrders(): Order[] {
    return this.allOrders
      .filter(o => o.status.statusName === 'จัดส่งแล้ว' || o.status.statusName === 'สำเร็จ')
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  get paginatedShippingOrders(): Order[] {
    const start = (this.shippingCurrentPage - 1) * this.pageSize;
    return this.ordersForShipping.slice(start, start + this.pageSize);
  }

  get shippingTotalPages(): number {
    return Math.ceil(this.ordersForShipping.length / this.pageSize);
  }

  changeShippingPage(page: number): void {
    if (page >= 1 && page <= this.shippingTotalPages) {
      this.shippingCurrentPage = page;
    }
  }

  get paginatedAllOrders(): Order[] {
    const start = (this.allOrdersCurrentPage - 1) * this.pageSize;
    return this.shippedOrders.slice(start, start + this.pageSize);
  }

  get allOrdersTotalPages(): number {
    return Math.ceil(this.shippedOrders.length / this.pageSize);
  }

  changeAllOrdersPage(page: number): void {
    if (page >= 1 && page <= this.allOrdersTotalPages) {
      this.allOrdersCurrentPage = page;
    }
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
}
