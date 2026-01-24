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
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
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
  private expiryInterval: any;
  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('ตรงนี้', this.currentUser)
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
  ngOnDestroy() {
    if (this.expiryInterval) {
      clearInterval(this.expiryInterval);
    }
  }
  loadOrders(customerId: number) {
    this.orderService.getOrdersByCustomer(customerId).subscribe({
      next: (data) => {
        this.orders = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        // Auto-cancel check
        this.expiryInterval = setInterval(() => {
          this.autoCancelExpiredOrders();
        }, 1000);
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
      if (order.status.statusName.includes('รอชำระ')) {
        const orderTime = new Date(order.orderDate).getTime();
        if (NOW > (orderTime + FIFTEEN_MINUTES)) {
          console.log(`Auto cancelling order #${order.orderId} (expired)`);
          this.orderService.cancelOrder(order.orderId).subscribe({
            next: () => {
              order.status.statusName = 'ยกเลิก (หมดเวลา)';
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
