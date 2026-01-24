import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Staff,
  Admin,
  Customer,
  Order,
  SystemConfig,
  Product,
  DashboardStat,
  Category,
  VerifyOrderPayload,
  MessageResponse,
  TopSeller,
  ProductLog
} from '../demo/models/product.model';

import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() { }

  getDashboardStats(): Observable<DashboardStat[]> {
    return this.http.get<DashboardStat[]>(`${this.apiUrl}/admin/stats`);
  }

  getAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.apiUrl}/admin/all`);
  }

  getPendingOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/admin/pending-verification`);
  }

  confirmOrder(orderId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/admin/confirm-order/${orderId}`, {}, { responseType: 'text' });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/product/get-all-product`);
  }

  updateStock(id: number, stock: number): Observable<Product> {
    const body: Partial<Product> = {
      productId: id,
      stock: stock
    };

    return this.http.put<Product>(`${this.apiUrl}/product/update/${id}`, body);
  }
  getStaffs(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/staff/all`);
  }

  updateStaffStatus(id: number, status: string): Observable<string> {
    const params = new HttpParams().set('newStatus', status);
    return this.http.put(`${this.apiUrl}/staff/${id}/status`, {}, { params, responseType: 'text' });
  }

  addStaff(staffData: Partial<Staff>): Observable<Staff> {
    return this.http.post<Staff>(`${this.apiUrl}/staff/add`, staffData);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/all`);
  }

  updateOrderStatus(orderId: number, statusName: string): Observable<Order | MessageResponse> {
    if (statusName === 'สำเร็จ') {
      return this.completeOrder(orderId);
    } else if (statusName === 'ยกเลิก') {
      return this.cancelOrder(orderId);
    } else if (statusName === 'ชำระเงินแล้ว') {
      return this.verifyOrder(orderId, true);
    } else {
      return this.verifyOrder(orderId, false);
    }
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customer/all`);
  }

  getSettings(): Observable<SystemConfig> {
    return this.http.get<SystemConfig>(`${this.apiUrl}/settings`);
  }

  saveSettings(config: SystemConfig): Observable<SystemConfig> {
    return this.http.post<SystemConfig>(`${this.apiUrl}/settings`, config);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/product/update/${id}`, product);
  }
  deleteProduct(id: number): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/product/delete/${id}`);
  }
  addProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/product/add`, product);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/category/get-all`);
  }
  verifyOrder(id: number, isApproved: boolean): Observable<MessageResponse> {
    const payload: VerifyOrderPayload = { isApproved: isApproved };

    return this.http.patch<MessageResponse>(`${this.apiUrl}/orders/${id}/verify`, payload);
  }
  acceptOrder(orderId: number, staffId: number): Observable<Order> {
    const params = new HttpParams().set('staffId', staffId.toString());
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/accept`, {}, { params });
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${id}/cancel`, {});
  }

  completeOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${id}/complete`, {});
  }
  getTopSellers(): Observable<TopSeller[]> {
    return this.http.get<TopSeller[]>(`${this.apiUrl}/orders/report/top-sellers`);
  }
  getOrdersByCustomer(id: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer/${id}/orders`);
  }
  getProductLogs(): Observable<ProductLog[]> {
    return this.http.get<ProductLog[]>(`${this.apiUrl}/product/logs`);
  }

  getProductLogsById(productId: number): Observable<ProductLog[]> {
    return this.http.get<ProductLog[]>(`${this.apiUrl}/product/logs/${productId}`);
  }

  updateAdmin(admin: Admin): Observable<Admin> {
    return this.http.put<Admin>(`${this.apiUrl}/admin/${admin.adminId}`, admin);
  }

  updateStaff(staff: Staff): Observable<Staff> {
    return this.http.put<Staff>(`${this.apiUrl}/staff/${staff.staffId}`, staff);
  }
  getMonthlySales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/report/monthly-sales`);
  }

  getWeeklyOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/report/weekly-orders`);
  }

  getDailyRevenue(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/report/daily-revenue`);
  }

  updateOrderShippingInfo(orderId: number, trackingNumber: string, shippingCost: number): Observable<Order> {
    const body = { trackingNumber, shippingCost };
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/shipping-info`, body);
  }

  addCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/category/add`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/category/delete/${id}`);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/category/update/${id}`, category);
  }
}
