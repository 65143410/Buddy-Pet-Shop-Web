// Angular import
import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { NavigationItem, NavigationItems } from '../navigation';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';

import { NavGroupComponent } from './nav-group/nav-group.component';

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  DashboardOutline,
  CreditCardOutline,
  LoginOutline,
  QuestionOutline,
  ChromeOutline,
  FontSizeOutline,
  ProfileOutline,
  BgColorsOutline,
  AntDesignOutline
} from '@ant-design/icons-angular/icons';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-nav-content',
  imports: [CommonModule, RouterModule, NavGroupComponent, NgScrollbarModule],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  private iconService = inject(IconService);
  private userService = inject(UserService);

  // public props
  NavCollapsedMob = output();

  navigations: NavigationItem[];

  // version
  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  navigation = NavigationItems;
  windowWidth = window.innerWidth;

  // Constructor
  constructor() {
    this.iconService.addIcon(
      ...[
        DashboardOutline,
        CreditCardOutline,
        FontSizeOutline,
        LoginOutline,
        ProfileOutline,
        BgColorsOutline,
        AntDesignOutline,
        ChromeOutline,
        QuestionOutline
      ]
    );
    this.navigations = []; // เริ่มต้นเป็นว่าง
  }

  private filterNavigationByRole(items: NavigationItem[]): NavigationItem[] {
    const role = this.userService.getUserRole();
    console.log('Current User Role for Menu Filtering:', role);

    return items
      .filter((item) => {
        // ถ้าไม่มีการกำหนด role ให้ผ่าน (เผื่อเมนูทั่วไป)
        if (!item.roles) return true;
        // ถ้ามี role ให้เช็คว่าตรงกับสิทธิ์ของผู้ใช้ไหม
        const hasAccess = role ? item.roles.includes(role) : false;
        console.log(`Menu Item: ${item.title}, Required Roles: ${item.roles}, Access Granted: ${hasAccess}`);
        return hasAccess;
      })
      .map((item) => {
        // ถ้ามีลูก ให้กรองลูกด้วย (Recursive)
        if (item.children) {
          return { ...item, children: this.filterNavigationByRole(item.children) };
        }
        return item;
      });
  }

  // Life cycle events
  ngOnInit() {
    // ติดตามการเปลี่ยนแปลงของผู้ใช้ เพื่อกรองเมนูใหม่ทันที
    this.userService.currentUser$.subscribe(() => {
      this.navigations = this.filterNavigationByRole(NavigationItems);
    });

    if (this.windowWidth < 1025) {
      (document.querySelector('.coded-navbar') as HTMLDivElement).classList.add('menupos-static');
    }
  }
  ngAfterViewInit() {
    const element = document.querySelector('.some-class'); // จุดที่ระบุในบรรทัด 71
    if (element) {
      element.classList.add('active');
    }
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  navMob() {
    const navElement = document.querySelector('app-navigation.coded-navbar');

    // ตรวจสอบว่า Element มีอยู่ (ไม่เป็น null) ก่อนใช้งาน
    if (navElement && this.windowWidth < 1025 && navElement.classList.contains('mob-open')) {
      this.NavCollapsedMob.emit();
    }
  }
}
