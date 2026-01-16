import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Customer } from '../demo/models/product.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private currentUserSubject = new BehaviorSubject<Customer | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        this.loadUser();
    }

    private loadUser() {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                this.currentUserSubject.next(user);
            } catch (e) {
                console.error('Error parsing user from local storage', e);
                this.currentUserSubject.next(null);
            }
        }
    }

    updateUser(user: Customer) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    getCurrentUserValue(): Customer | null {
        return this.currentUserSubject.value;
    }
}
