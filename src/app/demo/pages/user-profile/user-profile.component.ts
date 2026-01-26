import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { HttpClient } from '@angular/common/http';
import { Customer, Order } from 'src/app/demo/models/product.model';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment'; // <--- อย่าลืม import environment

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  currentUser: Customer | null = null;
  orders: Order[] = [];
  ongoingOrders: Order[] = [];
  isLoading = true;
  selectedOrder: Order | null = null;
  slipPreview: any = null;

  isEditMode = false;
  editUser: any = {};

  isPetFormVisible = false;
  isEditPetMode = false;
  newPet: any = { petName: '', petType: 'DOG', congenitalDisease: 'ไม่มี' };
  diseases = ['ไม่มี', 'ภูมิแพ้', 'โรคผิวหนัง', 'โรคหัวใจ', 'โรคไต', 'โรคอ้วน', 'โรคข้อเสื่อม', 'โรคระบบทางเดินอาหาร', 'อื่นๆ'];

  orderService = inject(OrderService);
  router = inject(Router);
  http = inject(HttpClient);
  sanitizer = inject(DomSanitizer);
  userService = inject(UserService);

  // ใช้ตัวแปรนี้แทน localhost
  private apiUrl = environment.apiUrl;
  private expiryInterval: any;

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
    if (currentUser && currentUser.customerId) {
      // แก้ตรงนี้: ใช้ this.apiUrl แทน localhost
      this.http.get(`${this.apiUrl}/customer/${currentUser.customerId}`).subscribe({
        next: (res: any) => {
          this.userService.updateUser(res);
        },
        error: () => {
          if (currentUser.customerId) this.loadOrders(currentUser.customerId);
        }
      });
    } else {
      // ถ้าไม่มี user ให้เด้งไปหน้า login (ป้องกัน error)
      // this.router.navigate(['/login']); 
    }
  }

  saveProfile() {
    if (!this.currentUser?.customerId) return;
    // แก้ตรงนี้
    const url = `${this.apiUrl}/customer/update/${this.currentUser.customerId}`;
    this.http.put(url, this.editUser).subscribe({
      next: (res: any) => {
        alert('บันทึกข้อมูลสำเร็จ!');
        this.isEditMode = false;
        this.refreshUserData();
      },
      error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
    });
  }

  savePet() {
    if (!this.newPet.petName) return alert('กรุณาระบุชื่อสัตว์เลี้ยง');
    const petData = { ...this.newPet, customerId: this.currentUser?.customerId };

    // แก้ตรงนี้
    let url = `${this.apiUrl}/pets/add`;
    let method = 'post';

    if (this.isEditPetMode && this.newPet.petId) {
      url = `${this.apiUrl}/pets/update/${this.newPet.petId}`;
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
      // แก้ตรงนี้
      this.http.delete(`${this.apiUrl}/pets/delete/${id}`, { responseType: 'text' }).subscribe(() => {
        this.refreshUserData();
      });
    }
  }

  // ... (ฟังก์ชันอื่นๆ: loadOrders, cancelOrder, viewDetail, submitSlip, getProfileImage คงเดิม) ...
  // อย่าลืม copy ฟังก์ชันที่เหลือมาใส่ให้ครบนะครับ

  ngOnDestroy() {
    if (this.expiryInterval) {
      clearInterval(this.expiryInterval);
    }
  }

  loadOrders(customerId: number) {
    this.orderService.getOrdersByCustomer(customerId).subscribe({
      next: (data) => {
        this.orders = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        this.expiryInterval = setInterval(() => { this.autoCancelExpiredOrders(); }, 1000);
        this.ongoingOrders = this.orders.filter(o =>
          !o.status.statusName.includes('ยกเลิก') &&
          !o.status.statusName.includes('สลิปไม่ถูกต้อง') &&
          !o.status.statusName.includes('สำเร็จ') &&
          !o.status.statusName.includes('จัดส่งแล้ว')
        );
        this.isLoading = false;
      },
      error: (err) => { this.isLoading = false; }
    });
  }

  autoCancelExpiredOrders() {
    const NOW = new Date().getTime();
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    this.orders.forEach(order => {
      if (order.status.statusName.includes('รอชำระ')) {
        const orderTime = new Date(order.orderDate).getTime();
        if (NOW > (orderTime + FIFTEEN_MINUTES)) {
          this.orderService.cancelOrder(order.orderId).subscribe({
            next: () => {
              order.status.statusName = 'ยกเลิก (หมดเวลา)';
              this.ongoingOrders = this.ongoingOrders.filter(o => o.orderId !== order.orderId);
            }
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
        if (this.currentUser?.customerId) this.loadOrders(this.currentUser.customerId);
      },
      error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) this.editUser = { ...this.currentUser };
  }

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

  viewDetail(order: Order) {
    this.selectedOrder = order;
    this.slipPreview = null;
  }

  closeDetailModal() {
    this.selectedOrder = null;
    this.slipPreview = null;
  }

  onSlipSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => { this.slipPreview = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  submitSlip() {
    if (!this.selectedOrder || !this.slipPreview) return;
    if (confirm('ยืนยันการส่งสลิปโอนเงิน?')) {
      this.orderService.submitPayment(this.selectedOrder.orderId, this.slipPreview, this.selectedOrder.totalAmount).subscribe({
        next: () => {
          alert('แจ้งชำระเงินเรียบร้อย!');
          this.closeDetailModal();
          if (this.currentUser?.customerId) this.loadOrders(this.currentUser.customerId);
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
      });
    }
  }

  getExpiryCountdown(order: Order): string {
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    const orderTime = new Date(order.orderDate).getTime();
    const expiryTime = orderTime + FIFTEEN_MINUTES;
    const NOW = new Date().getTime();
    const diff = expiryTime - NOW;
    if (diff <= 0) return 'หมดเวลา';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} นาที`;
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  getProfileImage(): SafeUrl | string {
    let img = this.currentUser?.image;
    if (!img) return 'assets/images/user/avatar-2.jpg';
    img = img.replace(/[\n\r\s]/g, '');
    if (img.startsWith('http')) return this.sanitizer.bypassSecurityTrustUrl(img);
    if (img.startsWith('data:')) return this.sanitizer.bypassSecurityTrustUrl(img);
    return this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,' + img);
  }

  onFileSelected(event: any, target: 'user' | 'pet') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (target === 'user') this.editUser.image = e.target.result;
        else if (target === 'pet') this.newPet.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}