import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { Customer, Order } from 'src/app/demo/models/product.model';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container mt-4">
      <div class="row">
        <!-- Sidebar Menu as a Card -->
        <div class="col-md-3 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-body text-center">
              <div class="avatar-circle mx-auto mb-3 bg-primary text-white d-flex align-items-center justify-content-center" style="width: 80px; height: 80px; font-size: 32px; border-radius: 50%;">
                <i class="fas fa-user"></i>
              </div>
              <h5 class="fw-bold">{{ currentUser?.customerName }}</h5>
              <p class="text-muted small">{{ currentUser?.email }}</p>
              <hr>
              <div class="text-start">
                  <a routerLink="/dashboard/home" class="d-block py-2 text-decoration-none text-dark"><i class="fas fa-home me-2 text-primary"></i> หน้าหลัก</a>
                  <a class="d-block py-2 text-decoration-none fw-bold text-primary"><i class="fas fa-history me-2"></i> ประวัติการสั่งซื้อ</a>
                  <a (click)="logout()" class="d-block py-2 text-decoration-none text-danger" style="cursor: pointer;"><i class="fas fa-sign-out-alt me-2"></i> ออกจากระบบ</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content (Orders) -->
        <div class="col-md-9">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-bold"><i class="fas fa-box-open me-2 text-primary"></i> ประวัติการสั่งซื้อของฉัน</h5>
            </div>
            <div class="card-body p-0">
              <div *ngIf="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
              </div>

              <div *ngIf="!isLoading && orders.length === 0" class="text-center py-5">
                <h2 class="text-muted mb-3"><i class="fas fa-shopping-cart"></i></h2>
                <p class="text-muted">คุณยังไม่มีรายการสั่งซื้อ</p>
                <a routerLink="/dashboard/home" class="btn btn-primary rounded-pill mt-2">ไปเลือกซื้อสินค้า</a>
              </div>

              <div *ngIf="!isLoading && orders.length > 0" class="table-responsive">
                <table class="table align-middle mb-0 table-hover">
                  <thead class="bg-light">
                    <tr>
                      <th class="py-3 ps-4">เลขที่ใบสั่งซื้อ</th>
                      <th class="py-3">วันที่สั่งซื้อ</th>
                      <th class="py-3 text-end">ยอดรวม</th>
                      <th class="py-3 text-center">สถานะ</th>
                      <th class="py-3 text-center">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let order of orders">
                      <td class="ps-4 fw-bold text-primary">{{ order.invoiceNo || '#' + order.orderId }}</td>
                      <td>{{ order.orderDate | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="text-end fw-bold">{{ order.totalAmount | currency:'THB' }}</td>
                      <td class="text-center">
                        <span class="badge rounded-pill" 
                              [ngClass]="{
                                'bg-warning text-dark': order.status.statusName === 'รอตรวจสอบยอดเงิน' || order.status.statusName === 'รอชำระเงิน',
                                'bg-success': order.status.statusName === 'ชำระเงินแล้ว' || order.status.statusName === 'สำเร็จ',
                                'bg-danger': order.status.statusName.includes('ยกเลิก')
                              }" style="font-size: 0.85rem; padding: 6px 12px;">
                          {{ order.status.statusName }}
                        </span>
                      </td>
                      <td class="text-center">
                         <!-- In a full app, this would open a detail modal -->
                         <button class="btn btn-sm btn-outline-secondary" (click)="viewDetail(order)">ดูรายการ</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Order Detail Modal (Backdrop logic can be improved) -->
    <div *ngIf="selectedOrder" class="modal-backdrop fade show"></div>
    <div *ngIf="selectedOrder" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
             <h5 class="modal-title">📦 รายละเอียด: {{ selectedOrder.invoiceNo }}</h5>
             <button type="button" class="btn-close" (click)="selectedOrder = null"></button>
          </div>
          <div class="modal-body">
             <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let item of selectedOrder.orderDetails">
                   <div>
                      <div class="fw-bold">{{ item.product?.productName }}</div>
                      <small class="text-muted">{{ item.unitPrice | currency:'THB' }} x {{ item.quantity }}</small>
                   </div>
                   <span class="text-primary fw-bold">{{ (item.unitPrice * item.quantity) | currency:'THB' }}</span>
                </li>
             </ul>
             <div class="text-end mt-3 h5">
                ยอดรวม: <span class="fw-bold text-primary">{{ selectedOrder.totalAmount | currency:'THB' }}</span>
             </div>
          </div>
          <div class="modal-footer">
             <button type="button" class="btn btn-secondary" (click)="selectedOrder = null">ปิด</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
    currentUser: Customer | null = null;
    orders: Order[] = [];
    isLoading = true;
    selectedOrder: Order | null = null;

    orderService = inject(OrderService);
    router = inject(Router);

    ngOnInit() {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            this.currentUser = JSON.parse(userJson);
            if (this.currentUser?.customerId) {
                this.loadOrders(this.currentUser.customerId);
            }
        } else {
            this.router.navigate(['/login']);
        }
    }

    loadOrders(customerId: number) {
        this.orderService.getOrdersByCustomer(customerId).subscribe({
            next: (data) => {
                this.orders = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()); // Newest first
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading orders', err);
                this.isLoading = false;
            }
        });
    }

    viewDetail(order: Order) {
        this.selectedOrder = order;
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
    }
}
