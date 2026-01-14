import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authUrl = 'http://localhost:8080/api/auth';
    private customerUrl = 'http://localhost:8080/api/customer';

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.authUrl}/login`, credentials);
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.customerUrl}/register`, data);
    }
}