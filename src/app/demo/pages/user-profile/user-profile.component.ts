import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { HttpClient } from '@angular/common/http';
import { Customer, Order } from 'src/app/demo/models/product.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <!-- Sidebar Menu as a Card -->
        <div class="col-md-3 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-body text-center">
              <div class="avatar-circle mx-auto mb-3 bg-primary text-white d-flex align-items-center justify-content-center" style="width: 80px; height: 80px; font-size: 32px; border-radius: 50%; overflow: hidden;">
                <img [src]="getProfileImage()" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              
              <div *ngIf="!isEditMode">
                <h5 class="fw-bold">{{ currentUser?.customerName }}</h5>
                <p class="text-muted small mb-1">{{ currentUser?.email }}</p>
                <p class="text-muted small mb-1">{{ currentUser?.phone || 'ไม่ระบุเบอร์โทร' }}</p>
                <button class="btn btn-sm btn-outline-primary mt-2" (click)="toggleEditMode()">
                  <i class="fas fa-edit"></i> แก้ไขข้อมูล
                </button>
              </div>

              <div *ngIf="isEditMode" class="text-start mt-3">
                <div class="mb-2">
                  <label class="small text-muted">ชื่อ</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="editUser.customerName">
                </div>
                <div class="mb-2">
                  <label class="small text-muted">เบอร์โทร</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="editUser.phone">
                </div>
                 <div class="mb-2">
                  <label class="small text-muted">ที่อยู่</label>
                  <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="editUser.address"></textarea>
                </div>
                <!-- Image Upload for User -->
                <div class="mb-2">
                  <label class="small text-muted">รูปโปรไฟล์</label>
                  <input type="file" class="form-control form-control-sm" (change)="onFileSelected($event, 'user')" accept="image/*">
                  <div *ngIf="editUser.image" class="mt-2">
                    <img [src]="editUser.image" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                  </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                  <button class="btn btn-sm btn-success w-50" (click)="saveProfile()">บันทึก</button>
                  <button class="btn btn-sm btn-secondary w-50" (click)="toggleEditMode()">ยกเลิก</button>
                </div>
              </div>

              <p *ngIf="currentUser?.createdAt && !isEditMode" class="text-muted small mt-3" style="font-size: 0.75rem;">
                <i class="far fa-clock me-1"></i> สมาชิกตั้งแต่: {{ currentUser?.createdAt | date:'d MMM yyyy' }}
              </p>
              <hr>
              <div class="d-grid gap-2">
                  <a routerLink="/dashboard/home" class="btn btn-outline-primary"><i class="fas fa-home me-2"></i> กลับหน้าหลัก</a>
                  <button (click)="logout()" class="btn btn-outline-danger"><i class="fas fa-sign-out-alt me-2"></i> ออกจากระบบ</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content (Pets & Orders) -->
        <div class="col-md-9">

        
          <!-- My Pets Section -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-bold text-success"><i class="fas fa-paw me-2"></i> สัตว์เลี้ยงของฉัน</h5>
              <button class="btn btn-primary btn-sm rounded-pill" (click)="prepareAddPet()">
                <i class="fas fa-plus"></i> เพิ่มสัตว์เลี้ยง
              </button>
            </div>
            
            <!-- Pet Form (Add/Edit) -->
            <div *ngIf="isPetFormVisible" class="card-body bg-light mx-3 my-3 rounded border">
              <h6 class="fw-bold mb-3">{{ isEditPetMode ? 'แก้ไขข้อมูลสัตว์เลี้ยง' : 'เพิ่มสัตว์เลี้ยงใหม่' }}</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="small mb-1">ชื่อสัตว์เลี้ยง</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="newPet.petName">
                </div>
                <div class="col-md-6">
                  <label class="small mb-1">ประเภท</label>
                  <select class="form-select form-select-sm" [(ngModel)]="newPet.petType">
                    <option value="DOG">สุนัข</option>
                    <option value="CAT">แมว</option>
                    <option value="GUINEA_PIG">หนูตะเภา</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="small mb-1">โรคประจำตัว</label>
                   <select class="form-select form-select-sm" [(ngModel)]="newPet.congenitalDisease">
                      <option *ngFor="let d of diseases" [value]="d">{{ d }}</option>
                   </select>
                </div>
                <div class="col-md-6">
                   <label class="small mb-1">พันธุ์ (Breed)</label>
                   <input type="text" class="form-control form-control-sm" [(ngModel)]="newPet.breed">
                </div>
                <div class="col-md-4">
                   <label class="small mb-1">น้ำหนัก (kg)</label>
                   <input type="number" class="form-control form-control-sm" [(ngModel)]="newPet.weight">
                </div>
                <div class="col-md-4">
                   <label class="small mb-1">เพศ</label>
                   <select class="form-select form-select-sm" [(ngModel)]="newPet.gender">
                      <option value="MALE">ตัวผู้</option>
                      <option value="FEMALE">ตัวเมีย</option>
                   </select>
                </div>
                <!-- Image Upload for Pet -->
                <div class="col-md-12">
                   <label class="small mb-1">รูปสัตว์เลี้ยง</label>
                   <input type="file" class="form-control form-control-sm" (change)="onFileSelected($event, 'pet')" accept="image/*">
                   <div *ngIf="newPet.image" class="mt-2">
                      <img [src]="newPet.image" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                   </div>
                </div>
                <div class="col-md-4">
                   <label class="small mb-1">การทำหมัน</label>
                   <select class="form-select form-select-sm" [(ngModel)]="newPet.isSterilized">
                      <option [ngValue]="true">ทำแล้ว</option>
                      <option [ngValue]="false">ยังไม่ทำ</option>
                   </select>
                </div>
                <div class="col-12 text-end mt-3">
                  <button class="btn btn-secondary btn-sm me-2" (click)="cancelPetForm()">ยกเลิก</button>
                  <button class="btn btn-success btn-sm" (click)="savePet()">บันทึกข้อมูล</button>
                </div>
              </div>
            </div>

            <div class="card-body">
               <div *ngIf="!currentUser?.pets || currentUser?.pets?.length === 0" class="text-center py-4 text-muted">
                  <p>ยังไม่มีข้อมูลสัตว์เลี้ยง</p>
               </div>
               <div class="row">
                  <div class="col-md-6 mb-3" *ngFor="let pet of currentUser?.pets">
                     <div class="d-flex align-items-center p-3 border rounded shadow-sm h-100 bg-light position-relative">
                        <div class="position-absolute top-0 end-0 p-2">
                           <button class="btn btn-link text-primary p-0 me-2" (click)="prepareEditPet(pet)"><i class="fas fa-edit"></i></button>
                           <button class="btn btn-link text-danger p-0" (click)="deletePet(pet.petId)"><i class="fas fa-trash"></i></button>
                        </div>
                        <div class="flex-shrink-0">
                           <img [src]="pet.image || (pet.petType === 'DOG' ? 'assets/dog-default.png' : 'assets/cat-default.png')" 
                                class="rounded-circle" style="width: 70px; height: 70px; object-fit: cover; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        </div>
                        <div class="flex-grow-1 ms-3">
                           <h5 class="mb-1 fw-bold">{{ pet.petName }}</h5>
                           <p class="mb-1 small text-muted">
                              <span class="badge bg-secondary me-1">{{ pet.petType === 'DOG' ? 'สุนัข' : 'แมว' }}</span>
                              {{ pet.breed ? pet.breed : '' }}
                           </p>
                           <p class="mb-0 small" style="font-size: 13px;">
                              <span *ngIf="pet.gender"><i class="fas fa-venus-mars"></i> {{ pet.gender === 'MALE' ? 'ผู้' : 'เมีย' }}</span>
                              <span class="mx-2" *ngIf="pet.gender && pet.weight">|</span>
                              <span *ngIf="pet.weight"><i class="fas fa-weight-hanging"></i> {{ pet.weight }} kg</span>
                           </p>
                           <p class="mb-0 small text-muted" style="font-size: 13px;">
                              <span *ngIf="pet.birthdate">
                                <i class="fas fa-birthday-cake me-1"></i>{{ pet.birthdate | date:'dd/MM/yyyy' }}
                              </span>
                              <span class="mx-2" *ngIf="pet.birthdate && pet.isSterilized !== undefined">|</span>
                              <span *ngIf="pet.isSterilized !== undefined">
                                <i class="fas" [ngClass]="pet.isSterilized ? 'fa-check text-success' : 'fa-times text-danger'"></i>
                                {{ pet.isSterilized ? 'ทำหมันแล้ว' : 'ยังไม่ทำหมัน' }}
                              </span>
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Tracking Active Orders -->
          <div *ngIf="ongoingOrders.length > 0" class="card shadow-sm border-0 mb-4">
             <div class="card-header bg-white py-3">
               <h5 class="mb-0 fw-bold text-warning"><i class="fas fa-shipping-fast me-2"></i> ติดตามสถานะคำสั่งซื้อ</h5>
             </div>
             <div class="card-body p-0">
                <div class="table-responsive">
                   <table class="table align-middle mb-0 table-hover">
                      <thead class="bg-light">
                         <tr>
                            <th class="py-3 ps-4">เลขที่ใบสั่งซื้อ</th>
                            <th class="py-3">วันที่สั่งซื้อ</th>
                            <th class="py-3 text-end">ยอดรวม</th>
                            <th class="py-3 text-center">สถานะ</th>
                         </tr>
                      </thead>
                      <tbody>
                         <tr *ngFor="let order of ongoingOrders" (click)="viewDetail(order)" style="cursor: pointer;">
                            <td class="ps-4 fw-bold text-primary">{{ order.invoiceNo || '#' + order.orderId }}</td>
                            <td>{{ order.orderDate | date:'dd/MM/yyyy HH:mm' }}</td>
                            <td class="text-end fw-bold">{{ order.totalAmount | currency:'THB' }}</td>
                            <td class="text-center" style="min-width: 150px;">
                               <span class="badge rounded-pill mb-2" [ngClass]="{
                                  'bg-warning text-dark': order.status.statusName.includes('รอ'),
                                  'bg-info text-white': order.status.statusName.includes('เตรียม'),
                                  'bg-primary': order.status.statusName.includes('ชำระ')
                               }">{{ order.status.statusName }}</span>
                               <div class="progress" style="height: 4px; width: 120px; margin: 0 auto;">
                                  <div class="progress-bar bg-success" role="progressbar" 
                                       [style.width]="order.status.statusName.includes('รอชำระ') ? '20%' : 
                                                      order.status.statusName.includes('ตรวจสอบ') ? '40%' :
                                                      order.status.statusName.includes('ชำระเงินแล้ว') ? '60%' :
                                                      order.status.statusName.includes('เตรียม') ? '80%' : '100%'">
                                  </div>
                               </div>
                            </td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          <!-- Order History Section -->
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
                    </tr>
                  </thead>
                  <tbody>
                     <tr *ngFor="let order of orders" (click)="viewDetail(order)" style="cursor: pointer;">
                       <td class="ps-4 fw-bold text-primary">{{ order.invoiceNo || '#' + order.orderId }}</td>
                       <td>{{ order.orderDate | date:'dd/MM/yyyy HH:mm' }}</td>
                       <td class="text-end fw-bold">{{ order.totalAmount | currency:'THB' }}</td>
                       <td class="text-center">
                         <span class="badge rounded-pill" 
                               [ngClass]="{
                                 'bg-warning text-dark': order.status.statusName.includes('รอ'),
                                 'bg-success': order.status.statusName === 'ชำระเงินแล้ว' || order.status.statusName === 'สำเร็จ',
                                 'bg-danger': order.status.statusName.includes('ยกเลิก')
                               }" style="font-size: 0.85rem; padding: 6px 12px;">
                           {{ order.status.statusName }}
                         </span>
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
              <div class="text-end mt-3">
                 <div *ngIf="selectedOrder.shippingCost" class="text-muted small">
                    ค่าจัดส่ง: {{ selectedOrder.shippingCost | currency:'THB' }}
                 </div>
                 <h5 class="mt-2">
                    ยอดรวมสุทธิ: <span class="fw-bold text-primary">{{ selectedOrder.totalAmount | currency:'THB' }}</span>
                 </h5>
              </div>

              <div *ngIf="selectedOrder.trackingNumber" class="alert alert-info mt-3">
                  <i class="fas fa-truck me-2"></i> เลขพัสดุ: <strong>{{ selectedOrder.trackingNumber }}</strong>
              </div>
              <div *ngIf="selectedOrder.shippingAddress" class="alert alert-light border mt-2">
                  <small class="text-muted d-block"><i class="fas fa-map-marker-alt me-1"></i> ที่อยู่จัดส่ง:</small>
                  {{ selectedOrder.shippingAddress }}
              </div>
               <div *ngIf="selectedOrder.payments && selectedOrder.payments.length > 0 && selectedOrder.payments[0].slipImage" class="mt-3">
                  <h6 class="border-bottom pb-2">หลักฐานการโอนเงิน</h6>
                  <img [src]="sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,' + (selectedOrder.payments[0].slipImage.includes('base64,') ? selectedOrder.payments[0].slipImage.split('base64,')[1] : selectedOrder.payments[0].slipImage))" 
                       class="img-fluid rounded border shadow-sm" style="max-height: 300px;">
               </div>

               <!-- Form to Upload Slip for 'Waiting for Payment' -->
               <div *ngIf="selectedOrder.status.statusName.includes('รอชำระ') || selectedOrder.status.statusName === 'รอตรวจสอบยอดเงิน'" class="mt-4 border-top pt-3">
                  <h6 class="text-warning"><i class="fas fa-upload me-2"></i> แจ้งชำระเงิน / อัปโหลดสลิป</h6>
                  <div class="mb-2">
                    <label class="small text-muted mb-1">เลือกไฟล์สลิป (รูปภาพ)</label>
                    <input type="file" class="form-control" (change)="onSlipSelected($event)" accept="image/*">
                  </div>
                  <div *ngIf="slipPreview" class="mb-2 text-center">
                    <img [src]="slipPreview" class="img-fluid rounded border" style="max-height: 200px;">
                  </div>
                  <button class="btn btn-success w-100" [disabled]="!slipPreview" (click)="submitSlip()">
                    <i class="fas fa-check-circle me-1"></i> ยืนยันการแจ้งโอน
                  </button>
               </div>

          </div>
          <div class="modal-footer justify-content-between">
             <button type="button" class="btn btn-outline-danger" 
                 *ngIf="selectedOrder!.status.statusName.includes('รอชำระ')"
                 (click)="cancelOrder(selectedOrder!)">
               <i class="fas fa-trash-alt me-1"></i> ยกเลิกคำสั่งซื้อ
             </button>
             <button type="button" class="btn btn-secondary" (click)="closeDetailModal()">ปิด</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  currentUser: Customer | null = null;
  orders: Order[] = [];
  ongoingOrders: Order[] = [];
  isLoading = true;
  selectedOrder: Order | null = null;
  slipPreview: any = null; // For upload preview

  // Edit Profile Mode
  isEditMode = false;
  editUser: any = {};

  // Pet Management
  isPetFormVisible = false;
  isEditPetMode = false;
  newPet: any = { petName: '', petType: 'DOG', congenitalDisease: 'ไม่มี' };
  diseases = ['ไม่มี', 'ภูมิแพ้', 'โรคผิวหนัง', 'โรคหัวใจ', 'โรคไต', 'โรคอ้วน', 'โรคข้อเสื่อม', 'โรคระบบทางเดินอาหาร', 'อื่นๆ'];

  orderService = inject(OrderService);
  router = inject(Router);
  http = inject(HttpClient);
  sanitizer = inject(DomSanitizer);
  userService = inject(UserService);

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.customerId) {
        this.loadOrders(this.currentUser.customerId);
      }
    });
    this.refreshUserData();
  }

  refreshUserData() {
    const currentUser = this.userService.getCurrentUserValue();
    if (currentUser) {
      if (currentUser.customerId) {
        this.http.get(`http://localhost:8080/api/customer/${currentUser.customerId}`).subscribe({
          next: (res: any) => {
            this.userService.updateUser(res);
          },
          error: () => {
            if (currentUser.customerId) this.loadOrders(currentUser.customerId);
          }
        });
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadOrders(customerId: number) {
    this.orderService.getOrdersByCustomer(customerId).subscribe({
      next: (data) => {
        this.orders = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        // Auto-cancel check
        this.autoCancelExpiredOrders();

        // Filter for Tracking Section: Exclude 'Cancelled' and 'Completed/Shipped'
        this.ongoingOrders = this.orders.filter(o =>
          !o.status.statusName.includes('ยกเลิก') &&
          !o.status.statusName.includes('สลิปไม่ถูกต้อง') &&
          !o.status.statusName.includes('สำเร็จ') &&
          !o.status.statusName.includes('จัดส่งแล้ว')
        );

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.isLoading = false;
      }
    });
  }

  autoCancelExpiredOrders() {
    const NOW = new Date().getTime();
    const FIFTEEN_MINUTES = 15 * 60 * 1000;

    this.orders.forEach(order => {
      if (order.status.statusName.includes('รอชำระ') || order.status.statusName === 'รอตรวจสอบยอดเงิน') {
        const orderTime = new Date(order.orderDate).getTime();
        if (NOW - orderTime > FIFTEEN_MINUTES) {
          console.log(`Auto cancelling order #${order.orderId} (expired)`);
          this.orderService.cancelOrder(order.orderId).subscribe({
            next: () => {
              // Update local status to reflect change immediately without full reload if possible,
              // or just let it update on next reload. For now, we update the object locally.
              order.status.statusName = 'ยกเลิก (หมดเวลา)';
              // Also remove from ongoing if needed
              this.ongoingOrders = this.ongoingOrders.filter(o => o.orderId !== order.orderId);
            },
            error: (err) => console.error('Failed to auto-cancel order', err)
          });
        }
      }
    });
  }

  cancelOrder(order: Order) {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?')) return;

    this.orderService.cancelOrder(order.orderId).subscribe({
      next: () => {
        alert('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว');
        this.closeDetailModal();
        if (this.currentUser?.customerId) {
          this.loadOrders(this.currentUser.customerId);
        }
      },
      error: (err) => {
        alert('เกิดข้อผิดพลาดในการยกเลิก: ' + (err.error?.message || err.message));
      }
    });
  }

  // --- Profile Edits ---
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.editUser = { ...this.currentUser };
    }
  }

  saveProfile() {
    if (!this.currentUser?.customerId) return;
    const url = `http://localhost:8080/api/customer/update/${this.currentUser.customerId}`;
    this.http.put(url, this.editUser).subscribe({
      next: (res: any) => {
        alert('บันทึกข้อมูลสำเร็จ!');
        this.isEditMode = false;
        this.refreshUserData();
      },
      error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
    });
  }

  // --- Pet Management ---
  prepareAddPet() {
    this.newPet = { petName: '', petType: 'DOG', congenitalDisease: 'ไม่มี' };
    this.isEditPetMode = false;
    this.isPetFormVisible = true;
  }

  prepareEditPet(pet: any) {
    this.newPet = { ...pet };
    this.isEditPetMode = true;
    this.isPetFormVisible = true;
  }

  cancelPetForm() {
    this.isPetFormVisible = false;
    this.newPet = {};
  }

  savePet() {
    if (!this.newPet.petName) return alert('กรุณาระบุชื่อสัตว์เลี้ยง');
    const petData = { ...this.newPet, customerId: this.currentUser?.customerId };

    // Use same endpoint for add (and adapt for edit if API supports)
    // Assuming backend handles update if ID is present or separate endpoint needed.
    // Based on previous nav-right code, we used add endpoint for both or re-used logic.
    // Let's assume standard 'add' endpoint for now or check if there is an update one.
    // If backend only has /add, we might need adjustments.
    // Re-using logic from NavRight:
    // Use correct endpoint based on mode
    let url = 'http://localhost:8080/api/pets/add';
    let method = 'post';

    if (this.isEditPetMode && this.newPet.petId) {
      url = `http://localhost:8080/api/pets/update/${this.newPet.petId}`;
      method = 'put';
    }

    // @ts-ignore
    this.http[method](url, petData).subscribe({
      next: () => {
        alert(this.isEditPetMode ? 'อัปเดตข้อมูลสัตว์เลี้ยงสำเร็จ!' : 'เพิ่มสัตว์เลี้ยงสำเร็จ!');
        this.isPetFormVisible = false;
        this.refreshUserData();
      },
      error: (err) => alert('เกิดข้อผิดพลาด: ' + err.message)
    });
  }

  deletePet(id: number) {
    if (confirm('ยืนยันการลบข้อมูลสัตว์เลี้ยง?')) {
      this.http.delete(`http://localhost:8080/api/pets/delete/${id}`, { responseType: 'text' }).subscribe(() => {
        this.refreshUserData();
      });
    }
  }

  viewDetail(order: Order) {
    this.selectedOrder = order;
    this.slipPreview = null; // Reset preview
  }

  closeDetailModal() {
    this.selectedOrder = null;
    this.slipPreview = null;
  }

  onSlipSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.slipPreview = e.target.result; // Base64
      };
      reader.readAsDataURL(file);
    }
  }

  submitSlip() {
    if (!this.selectedOrder || !this.slipPreview) return;

    if (confirm('ยืนยันการส่งสลิปโอนเงิน?')) {
      this.orderService.submitPayment(this.selectedOrder.orderId, this.slipPreview, this.selectedOrder.totalAmount).subscribe({
        next: () => {
          alert('แจ้งชำระเงินเรียบร้อย! ทางร้านจะตรวจสอบโดยเร็วที่สุด');
          this.closeDetailModal();
          // Reload orders
          if (this.currentUser?.customerId) {
            this.loadOrders(this.currentUser.customerId);
          }
        },
        error: (err) => {
          console.error(err);
          const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || err.message);
          alert('เกิดข้อผิดพลาด: ' + errorMsg);
        }
      });
    }
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  getProfileImage(): SafeUrl | string {
    let img = this.currentUser?.image;
    if (!img) return 'assets/images/user/avatar-2.jpg';

    // 1. Initial Clean: remove whitespace
    img = img.replace(/[\n\r\s]/g, '');

    // Debug: Log length to detect truncation
    // console.log('Profile Image Check [User-Profile]:', { length: img.length, start: img.substring(0, 30), end: img.substring(img.length - 10) });

    // 2. Already HTTP Check
    if (img.startsWith('http')) {
      return this.sanitizer.bypassSecurityTrustUrl(img);
    }

    // 3. Handle Data URI
    if (img.startsWith('data:')) {
      // Re-validate structure: data:[<mediatype>][;base64],<data>
      if (img.includes('base64') && !img.includes('base64,')) {
        console.warn('Fixing malformed data URI (missing comma)');
        img = img.replace('base64', 'base64,');
      }
      return this.sanitizer.bypassSecurityTrustUrl(img);
    }

    // 4. Raw Base64 Handling
    const prefix = 'data:image/jpeg;base64,';
    return this.sanitizer.bypassSecurityTrustUrl(prefix + img);
  }

  onFileSelected(event: any, target: 'user' | 'pet') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;
        if (target === 'user') {
          this.editUser.image = base64;
        } else if (target === 'pet') {
          this.newPet.image = base64;
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
