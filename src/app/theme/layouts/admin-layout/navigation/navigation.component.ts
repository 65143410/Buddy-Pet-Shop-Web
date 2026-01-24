import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/app/services/user.service';

import { NavContentComponent } from './nav-content/nav-content.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [NavContentComponent, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  private userService = inject(UserService);

  get role() {
    return this.userService.getUserRole();
  }

  NavCollapsedMob = output();

  navCollapsedMob;
  windowWidth: number;


  constructor() {
    this.windowWidth = window.innerWidth;
    this.navCollapsedMob = false;
  }


  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }
}
