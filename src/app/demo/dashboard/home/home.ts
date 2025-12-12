import { Component , OnInit } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Category } from './category/category';
import { IconDirective } from '@ant-design/icons-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: [ './home.scss' ],
  imports: [RouterOutlet, Category,IconDirective]
})
export class Home implements OnInit {
constructor( ) {
  }


   ngOnInit() {
    console.log()
  }
}
