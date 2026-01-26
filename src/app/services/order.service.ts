import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl = `${environment.apiUrl}/order`;

    private http = inject(HttpClient);

    getOrdersByCustomer(customerId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/customer/${customerId}`);
    }

    createOrder(orderData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}`, orderData);
    }

    createOrderWithSlip(orderData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, orderData);
    }
    submitPayment(orderId: number, slipImage: string, amount?: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${orderId}/payment`, { slipImage, amount });
    }

    cancelOrder(orderId: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/${orderId}/cancel`, {});
    }
}