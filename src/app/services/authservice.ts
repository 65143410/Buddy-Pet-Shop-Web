import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authUrl = `${environment.apiUrl}/auth`;
    private customerUrl = `${environment.apiUrl}/customer`;

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.authUrl}/login`, credentials);
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.customerUrl}/register`, data);
    }
}