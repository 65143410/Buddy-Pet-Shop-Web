import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router'; // *** Import RouterModule ***
import { products } from '../product-item';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';

// Interface นี้ถูกต้องแล้ว
interface Product {
    id: number;
    name: string;
    category: string;
    categoryId: number;
    price: number;
    image: string;
}

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './product-detail.html',
    styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {
    productId: number | null = null;

    product: Product | undefined;
    route = inject(ActivatedRoute);
    cartService =inject(CartService);
    constructor() {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const productIdString = params.get('productId');
            if (productIdString) {
                const idNumber = +productIdString;
                this.productId = idNumber;
                this.loadProductDetails(idNumber);
            }
        });
    }

    loadProductDetails(id: number): void {
        const foundProduct = products.find(p => p.id === id);

        if (foundProduct) {
            this.product = foundProduct;
        } else {
            console.error(`Product with ID ${id} not found.`);
            this.product = undefined;
        }
    }
    public addToCart(product: Product): void {
        this.cartService.add(product);
      }
}
