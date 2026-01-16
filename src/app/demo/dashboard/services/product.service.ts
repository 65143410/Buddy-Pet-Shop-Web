import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../home/types/products';
import { products } from '../home/product-item';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/product';

  constructor() { }

  getAll(): Product[] {
    return products;
  }

  getCategoryItems(id: number): Product[] {
    return products.filter(item => item.categoryId == id);
  }

  getRecommendedProducts(petType: string, disease: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recommend?type=${petType}&disease=${disease}`);
  }

}
