import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CartProduct, Product } from '../demo/models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartItems: CartProduct[] = [];

  cartUpdates = new Subject<void>();
  cartUpdates$ = this.cartUpdates.asObservable();

  get count(): number {
    return this.cartItems.reduce((total, item) => item.qty + total, 0);
  }

  constructor() {}

  add(product: Product): void {
    const existingItem = this.cartItems.find((item) => item.productId === product.productId);

    if (existingItem) {
      existingItem.qty++;
    } else {
      const newCartItem: CartProduct = {
        ...product,
        qty: 1
      };
      this.cartItems.push(newCartItem);
    }
    this.cartUpdates.next();
  }
  remove(productId: string | number): void {
    this.cartItems = this.cartItems.filter((item) => item.productId !== productId);
    this.cartUpdates.next();
  }

  clearCart(): void {
    this.cartItems = [];
    this.cartUpdates.next();
  }
}
