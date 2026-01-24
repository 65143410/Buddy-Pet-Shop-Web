import { Router, RouterModule } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from 'src/app/services/ProductService';
import { Category as CategoryModel, Product } from 'src/app/demo/models/product.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './category.html',
  styleUrls: ['./category.scss']
})
export class Category implements OnInit {
  public categories: CategoryModel[] = [];
  public products: Product[] = [];

  router = inject(Router);
  productService = inject(ProductService);

  constructor() { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
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

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('ไม่สามารถดึงข้อมูลสินค้าได้:', err);
      }
    });
  }

  addCategory(): void {
    const name = window.prompt('กรุณากรอกชื่อประเภทสินค้าใหม่:');
    if (name && name.trim()) {
      this.productService.addCategory({ categoryName: name.trim() }).subscribe({
        next: () => {
          alert('เพิ่มประเภทสินค้าสำเร็จ!');
          this.loadCategories();
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
      });
    }
  }

  deleteCategory(event: Event, cat: CategoryModel): void {
    event.stopPropagation();
    const productCount = this.products.filter(p => p.category?.categoryId === cat.categoryId).length;

    if (productCount > 0) {
      alert(`ไม่สามารถลบประเภทสินค้า "${cat.categoryName}" ได้ เนื่องจากมีสินค้าอยู่ในประเภทนี้ ${productCount} รายการ`);
      return;
    }

    if (confirm(`คุณต้องการลบประเภทสินค้า "${cat.categoryName}" ใช่หรือไม่?`)) {
      this.productService.deleteCategory(cat.categoryId).subscribe({
        next: () => {
          alert('ลบประเภทสินค้าสำเร็จ!');
          this.loadCategories();
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
      });
    }
  }

  editCategory(event: Event, cat: CategoryModel): void {
    event.stopPropagation();
    const newName = window.prompt('แก้ไขชื่อประเภทสินค้า:', cat.categoryName);
    if (newName && newName.trim() && newName.trim() !== cat.categoryName) {
      this.productService.updateCategory(cat.categoryId, { categoryName: newName.trim() }).subscribe({
        next: () => {
          alert('แก้ไขประเภทสินค้าสำเร็จ!');
          this.loadCategories();
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
      });
    }
  }

  goToProducts(categoryId: number | string) {
    this.router.navigate(['home/product', categoryId]);
  }

  trackByCatId(index: number, category: CategoryModel): number | string {
    return category.categoryId;
  }
}
