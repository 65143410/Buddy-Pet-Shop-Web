import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Product } from '../demo/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/product';
  private apiUrlCategory = 'http://localhost:8080/api/category';
  constructor() { }
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/get-all-product`);
  }

  getProductById(id: string | number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrlCategory}/get-all`);
  }

  getRecommendedProducts(petType: string, disease: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recommend?type=${petType}&disease=${disease}`);
  }

  addCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrlCategory}/add`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrlCategory}/delete/${id}`);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrlCategory}/update/${id}`, category);
  }
}
