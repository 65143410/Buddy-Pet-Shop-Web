import { Injectable } from '@angular/core';
import { Product } from '../home/types/products';
import { products } from '../home/product-item';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor() { }

  getAll():Product[] {
    return products;
  }

  getCategoryItems(id:number): Product [] {
    return products.filter(item => item.categoryId == id );
  }

}
