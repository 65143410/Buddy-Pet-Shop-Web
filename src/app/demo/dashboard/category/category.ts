import { Router, RouterModule } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from 'src/app/services/ProductService';
import { Category as CategoryModel } from 'src/app/demo/models/product.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './category.html',
  styleUrls: ['./category.scss']
})
export class Category implements OnInit {
  public categories: CategoryModel[] = [];

  router = inject(Router);
  productService = inject(ProductService);

  constructor() {}

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        console.log('โหลดข้อมูลหมวดหมู่สำเร็จ:', data);
      },
      error: (err) => {
        console.error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้:', err);
      }
    });
  }

  goToProducts(categoryId: number | string) {
    this.router.navigate(['home/product', categoryId]);
  }

  trackByCatId(index: number, category: CategoryModel): number | string {
    return category.categoryId;
  }
}
