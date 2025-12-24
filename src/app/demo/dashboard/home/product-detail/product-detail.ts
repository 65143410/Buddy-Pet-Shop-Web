import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CartService } from 'src/app/services/cart.service';
import { Product } from 'src/app/demo/models/product.model';
import { ProductService } from 'src/app/services/ProductService';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {
  productId: string | number | null = null;
  product: Product | undefined;

  route = inject(ActivatedRoute);
  cartService = inject(CartService);
  productService = inject(ProductService);

  temp_img_url = "https://www.prachachat.net/wp-content/uploads/2023/05/%E0%B8%94%E0%B8%B5%E0%B9%84%E0%B8%8B%E0%B8%99%E0%B9%8C%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD-6.jpg";


  constructor() {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');

      if (idParam) {
        this.productId = idParam;
        this.loadProductDetails(idParam);
      }
    });
  }

  loadProductDetails(id: string): void {
    this.productService.getProducts().subscribe({
      next: (allProducts) => {
        const foundProduct = allProducts.find((p) => p.productId == Number(id));

        if (foundProduct) {
          this.product = foundProduct;
        } else {
          console.error(`Product with ID ${id} not found.`);
          this.product = undefined;
        }
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
      }
    });
  }

  public addToCart(product: Product): void {
    this.cartService.add(product);
  }
}
