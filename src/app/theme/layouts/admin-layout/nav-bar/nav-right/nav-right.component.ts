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
  ArrowLeftOutline,
  GithubOutline
} from '@ant-design/icons-angular/icons';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CartList } from 'src/app/demo/dashboard/cart-list/cart-list';
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
  // userPets: any[] = [];
  // newPet: any = { petName: '', petType: 'DOG', congenitalDisease: 'ไม่มี' };
  // diseases = ['ไม่มี', 'ภูมิแพ้', 'โรคผิวหนัง', 'โรคหัวใจ', 'โรคไต', 'อื่นๆ'];
  // isEditPetMode: boolean = false;
  private router = inject(Router);
  currentUser: any = null;
  constructor() {
    this.windowWidth = window.innerWidth;
    this.loadUserInfo();
    this.loadOrderNotifications();
    // this.loadUserPets();
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
        ArrowLeftOutline,
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
    { icon: 'user', title: 'View Profile', fn: 'view-profile' },
    { icon: 'logout', title: 'Logout', fn: 'logout' },
  ];

  // Unused methods removed
  /*
  saveProfile() { ... }
  addPet() { ... }
  loadUserPets() { ... }
  prepareEditPet() { ... }
  savePet() { ... }
  deletePet() { ... }
  resetPetForm() { ... }
  */

  // แก้ไขฟังก์ชัน test เดิมให้ครอบคลุม
  test(param: string | undefined) {
    if (!param) return;
    if (param === 'logout') return this.logout();

    if (param === 'view-profile') {
      this.router.navigate(['/dashboard/profile']);
    }
  }
}
