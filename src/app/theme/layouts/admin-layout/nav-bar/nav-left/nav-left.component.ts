
import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';


import { IconService, IconDirective } from '@ant-design/icons-angular';
import { MenuUnfoldOutline, MenuFoldOutline, SearchOutline } from '@ant-design/icons-angular/icons';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-nav-left',
  imports: [IconDirective, CommonModule],
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent {
  private iconService = inject(IconService);
  private userService = inject(UserService);

  get role() {
    return this.userService.getUserRole();
  }


  navCollapsed = input.required<boolean>();
  NavCollapse = output();
  NavCollapsedMob = output();
  windowWidth: number;


  constructor() {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(...[MenuUnfoldOutline, MenuFoldOutline, SearchOutline]);
  }


  navCollapse() {
    this.NavCollapse.emit();
  }
}
