import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl = 'http://localhost:8080/api/orders';
    private http = inject(HttpClient);

    getOrdersByCustomer(customerId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/customer/${customerId}`);
    }

    createOrder(orderData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}`, orderData);
    }
}