import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';



import { Product } from 'src/app/demo/models/product.model';

import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/ProductService';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
})
export class ProductList implements OnInit {
  public selectedCatList: Product[] = [];
  private originalCatList: Product[] = [];

  route = inject(ActivatedRoute);
  router = inject(Router);
  cartService = inject(CartService);
  productService = inject(ProductService);

  temp_img_url = "https://www.prachachat.net/wp-content/uploads/2023/05/%E0%B8%94%E0%B8%B5%E0%B9%84%E0%B8%8B%E0%B8%99%E0%B9%8C%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD-6.jpg";

  public goHome(): void {
    this.router.navigate(['/dashboard/home']);
  }
  constructor() { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const categoryId = idParam ? parseInt(idParam, 10) : NaN;

    if (!isNaN(categoryId)) {
      this.productService.getProducts().subscribe({
        next: (allProducts) => {
          const filteredList = allProducts.filter(p => p.category?.categoryId === categoryId);

          this.originalCatList = [...filteredList];
          this.selectedCatList = [...filteredList];

          this.selectedCatList.sort((a, b) => Number(b.productId) - Number(a.productId));
        },
        error: (err) => {
          console.error('Error fetching products:', err);
        }
      });
    } else {
      this.selectedCatList = [];
    }
  }

  public onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();

    if (!searchTerm) {
      this.selectedCatList = [...this.originalCatList];
    } else {
      this.selectedCatList = this.originalCatList.filter(p =>
        p.productName.toLowerCase().includes(searchTerm) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    }
  }

  public addToCart(product: Product): void {
    this.cartService.add(product);
  }

  public translateFormula(formula: string): string {
    const map: { [key: string]: string } = {
      'NONE': 'สุขภาพปกติ',
      'SKIN_ALLERGY': 'โรคผิวหนัง/แพ้ง่าย',
      'KIDNEY_DISEASE': 'โรคไต',
      'WEIGHT_CONTROL': 'ควบคุมน้ำหนัก',
      'OBESITY': 'โรคอ้วน',
      'JOINT_ISSUES': 'โรคข้อเสื่อม',
      'DIGESTIVE_ISSUES': 'โรคระบบทางเดินอาหาร'
    };
    return map[formula] || formula;
  }

  public onSortChange(event: Event): void {
    const sortValue = (event.target as HTMLSelectElement).value;

    switch (sortValue) {
      case 'price_asc':
        this.selectedCatList.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        this.selectedCatList.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        this.selectedCatList.sort((a, b) => Number(b.productId) - Number(a.productId));
        break;
      case 'recommended':
        this.selectedCatList = [...this.originalCatList].sort((a, b) => Number(b.productId) - Number(a.productId));
        break;
      default:
        break;
    }
    this.selectedCatList = [...this.selectedCatList];
  }

  public handleCardClick(event: MouseEvent, id: number | string): void {
    const target = event.target as HTMLElement;
    const isCartButton = target.closest('.add-to-cart-btn');

    if (isCartButton) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.router.navigate(['/home/detail', id]);
  }

  trackByProductId(index: number, item: Product): string | number {
    return item.productId;
  }
}
