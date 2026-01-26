import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, Staff } from '../demo/models/product.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class StaffApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() { }

  getAllStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/staff/all`);
  }

  updateStaffStatus(id: number, newStatus: string): Observable<string> {
    const params = new HttpParams().set('newStatus', newStatus);
    return this.http.put(`${this.apiUrl}/staff/${id}/status`, {}, { params, responseType: 'text' });
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/all`);
  }

  acceptOrder(orderId: number, staffId: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/accept?staffId=${staffId}`, {});
  }

  completeOrder(orderId: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/complete`, {});
  }

  updateOrderShippingInfo(orderId: number, trackingNumber: string, shippingCost: number): Observable<Order> {
    const body = { trackingNumber, shippingCost };
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/shipping-info`, body);
  }
}
