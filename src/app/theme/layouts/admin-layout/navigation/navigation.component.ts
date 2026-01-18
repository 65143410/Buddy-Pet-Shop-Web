
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';



import { NavContentComponent } from './nav-content/nav-content.component';

@Component({
  selector: 'app-navigation',
  imports: [NavContentComponent, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {

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
