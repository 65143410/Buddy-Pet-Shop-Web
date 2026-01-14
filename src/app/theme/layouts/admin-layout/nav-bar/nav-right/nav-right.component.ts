import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline
} from '@ant-design/icons-angular/icons';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CartList } from 'src/app/demo/dashboard/home/cart-list/cart-list';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-nav-right',
  imports: [CommonModule, IconDirective, RouterModule, FormsModule, NgScrollbarModule, NgbNavModule, NgbDropdownModule, CartList],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {
  private iconService = inject(IconService);
  private orderService = inject(OrderService);
  styleSelectorToggle = input<boolean>();
  private http = inject(HttpClient);
  Customize = output();
  windowWidth: number;
  screenFull: boolean = true;
  notifications: any[] = [];
  unreadCount = 0;
  activeSubPage: string = 'default';
  userPets: any[] = [];
  newPet: any = { petName: '', petType: 'DOG', congenitalDisease: '' };
  isEditPetMode: boolean = false;
  private router = inject(Router);
  currentUser: any = null;
  constructor() {
    this.windowWidth = window.innerWidth;
    this.loadUserInfo();
    this.loadOrderNotifications();
    this.loadUserPets();
    this.iconService.addIcon(
      ...[
        CheckCircleOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        LogoutOutline,
        UserOutline,
        EditOutline,
        ProfileOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline,
        BellOutline,
        GithubOutline,
        WalletOutline
      ]
    );
  }
  loadUserInfo() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
  markAllAsRead() {
    console.log("All notifications marked as read");
    this.notifications = [];
  }

  readNotification(id: number) {
    console.log("Reading notification ID:", id);
  }
  selectedOrderDetail: any = null;

  loadOrderNotifications() {
    if (this.currentUser && this.currentUser.customerId) {
      this.orderService.getOrdersByCustomer(this.currentUser.customerId).subscribe(orders => {
        this.notifications = orders.map(order => ({
          id: order.orderId,
          icon: order.status.statusName.includes('ส่ง') ? 'phone' : 'gift',
          color: order.status.statusName.includes('สำเร็จ') ? 'bg-light-success' : 'bg-light-primary',
          time: order.orderDate,
          content: `ออเดอร์ <b>#${order.invoiceNo || order.orderId}</b>: ${order.status.statusName}`,
          date: 'สถานะล่าสุด',
          originalOrder: order // Store full order object
        })).slice(0, 5);
        this.unreadCount = this.notifications.length;
      });
    }
  }

  viewOrderDetails(order: any) {
    this.selectedOrderDetail = order;
  }

  closeOrderDetails() {
    this.selectedOrderDetail = null;
  }
  profile = [
    { icon: 'edit', title: 'Edit Profile', fn: 'edit-profile' },
    { icon: 'user', title: 'View Profile', fn: 'view-profile' },
    { icon: 'unordered-list', title: 'History', fn: 'history' },
    { icon: 'logout', title: 'Logout', fn: 'logout' },
  ];

  // ฟังก์ชันสำหรับกดปุ่ม Back เพื่อกลับไปหน้าเมนูหลัก
  goBack() {
    this.activeSubPage = 'default';
  }
  saveProfile() {
    if (!this.currentUser || !this.currentUser.customerId) return;
    const url = `http://localhost:8080/api/customer/update/${this.currentUser.customerId}`;

    this.http.put(url, this.currentUser).subscribe({
      next: (res: any) => {
        localStorage.setItem('currentUser', JSON.stringify(res));
        this.currentUser = res;
        alert('บันทึกข้อมูลสำเร็จ!');
        this.activeSubPage = 'view-profile';
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + (err.error?.message || err.message));
      }
    });
  }

  // เพิ่มสัตว์เลี้ยงใหม่
  addPet() {
    if (!this.newPet.petName) return alert('กรุณาระบุชื่อสัตว์เลี้ยง');

    // เตรียมข้อมูลตาม PetRequestDTO (customerId ต้องส่งไปด้วย)
    const petData = {
      ...this.newPet,
      customerId: this.currentUser.customerId
    };

    this.http.post('http://localhost:8080/api/pets/add', petData).subscribe({
      next: () => {
        alert('เพิ่มสัตว์เลี้ยงสำเร็จ!');
        this.newPet = { petName: '', petType: 'DOG', congenitalDisease: '' }; // reset form
        this.loadUserPets(); // refresh list
        this.activeSubPage = 'view-profile';
      },
      error: (err) => alert('เกิดข้อผิดพลาด: ' + err.message)
    });
  }

  // ปรับปรุงฟังก์ชัน test เพื่อโหลดข้อมูลสัตว์เลี้ยงเมื่อเปิดหน้า Profile
  loadUserPets() {
    if (this.currentUser?.customerId) {
      this.http.get<any[]>(`http://localhost:8080/api/pets/customer/${this.currentUser.customerId}`)
        .subscribe(pets => this.userPets = pets);
    }
  }

  // เตรียมข้อมูลสัตว์เลี้ยงที่จะแก้ไข
  prepareEditPet(pet: any) {
    this.newPet = { ...pet };
    this.isEditPetMode = true;
    this.activeSubPage = 'manage-pet-form'; // ย้ายไปหน้าฟอร์ม
  }

  // บันทึกสัตว์เลี้ยง (รองรับทั้งเพิ่มใหม่และแก้ไข)
  savePet() {
    if (!this.newPet.petName) return alert('กรุณาระบุชื่อสัตว์เลี้ยง');

    const petData = { ...this.newPet, customerId: this.currentUser.customerId };

    if (this.isEditPetMode) {
      // ในกรณีแก้ไข (ถ้ามี Endpoint Put ใน PetController ให้ใช้ .put)
      // หากยังไม่มี ใช้ .post ตัวเดิมตามที่ Service คุณรองรับ
      this.http.post('http://localhost:8080/api/pets/add', petData).subscribe({
        next: () => {
          alert('อัปเดตข้อมูลสัตว์เลี้ยงสำเร็จ!');
          this.resetPetForm();
        }
      });
    } else {
      this.http.post('http://localhost:8080/api/pets/add', petData).subscribe({
        next: () => {
          alert('เพิ่มสัตว์เลี้ยงสำเร็จ!');
          this.resetPetForm();
        }
      });
    }
  }

  deletePet(id: number) {
    if (confirm('ยืนยันการลบข้อมูลสัตว์เลี้ยง?')) {
      this.http.delete(`http://localhost:8080/api/pets/delete/${id}`, { responseType: 'text' }).subscribe(() => {
        this.loadUserPets();
      });
    }
  }

  resetPetForm() {
    this.newPet = { petName: '', petType: 'DOG', congenitalDisease: '' };
    this.isEditPetMode = false;
    this.loadUserPets();
    this.activeSubPage = 'edit-profile'; // กลับไปหน้าแก้ไขหลัก
  }

  // แก้ไขฟังก์ชัน test เดิมให้ครอบคลุม
  test(param: string | undefined) {
    if (!param) return;
    if (param === 'logout') return this.logout();

    this.activeSubPage = param;
    if (['view-profile', 'edit-profile', 'manage-pet-form'].includes(param)) {
      this.loadUserPets();
    }
  }
}

