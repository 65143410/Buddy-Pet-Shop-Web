
import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';


import { NavigationItem, NavigationItems } from '../navigation';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';

import { NavGroupComponent } from './nav-group/nav-group.component';


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


  NavCollapsedMob = output();

  navigations: NavigationItem[];


  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  navigation = NavigationItems;
  windowWidth = window.innerWidth;


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
    this.navigations = [];
  }

  private filterNavigationByRole(items: NavigationItem[]): NavigationItem[] {
    const role = this.userService.getUserRole();


    return items
      .filter((item) => {
        if (!item.roles) return true;
        const hasAccess = role ? item.roles.includes(role) : false;
        return hasAccess;
      })
      .map((item) => {
        if (item.children) {
          return { ...item, children: this.filterNavigationByRole(item.children) };
        }
        return item;
      });
  }


  ngOnInit() {
    this.userService.currentUser$.subscribe(() => {
      this.navigations = this.filterNavigationByRole(NavigationItems);
    });

    if (this.windowWidth < 1025) {
      (document.querySelector('.coded-navbar') as HTMLDivElement).classList.add('menupos-static');
    }
  }
  ngAfterViewInit() {
    const element = document.querySelector('.some-class');
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


    if (navElement && this.windowWidth < 1025 && navElement.classList.contains('mob-open')) {
      this.NavCollapsedMob.emit();
    }
  }
}
