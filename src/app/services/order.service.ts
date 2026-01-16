import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
    // ใช้ environment เพื่อให้เปลี่ยน URL ได้ง่าย (และไม่ต้อง Hardcode)
    private apiUrl = 'http://localhost:8080/api/orders';
    // TODO: เมื่อแก้ทุกไฟล์เสร็จแล้ว ควรเปลี่ยนเป็น: private apiUrl = `${environment.apiUrl}/orders`;

    private http = inject(HttpClient);

    getOrdersByCustomer(customerId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/customer/${customerId}`);
    }

    // แบบเก่า (ส่ง JSON ล้วน)
    createOrder(orderData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}`, orderData);
    }

    // แบบใหม่ (ส่ง JSON พร้อม Base64 String)
    createOrderWithSlip(orderData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, orderData);
    }
    // แจ้งชำระเงินสำหรับออเดอร์ที่มีอยู่แล้ว
    submitPayment(orderId: number, slipImage: string, amount?: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${orderId}/payment`, { slipImage, amount });
    }
}