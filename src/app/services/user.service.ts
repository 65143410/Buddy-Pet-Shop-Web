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
                this.initializeGuestUser();
            }
        } else {
            this.initializeGuestUser();
        }
    }

    private initializeGuestUser() {
        const guestUser: any = {
            customerId: 0,
            customerName: 'Guest',
            email: 'guest@example.com',
            phone: '',
            role: 'GUEST'
        };
        // Don't save guest to localStorage if we want 'first time' logic?
        // But the requirement says "always enter by guest account... before login".
        // Saving it to state is enough. Writing to localStorage keeps it persistent across reloads until login.
        // If we don't write to localStorage, a refresh might lose it (but loadUser runs again).
        // Let's write it to ensure consistency.
        // Actually, if we write it, next time they visit, they are Guest.
        // If they login, we overwrite.
        // If they logout, we revert to Guest.
        this.currentUserSubject.next(guestUser);
    }

    updateUser(user: Customer) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.initializeGuestUser();
    }

    getCurrentUserValue(): Customer | null {
        return this.currentUserSubject.value;
    }

    getUserRole(): 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER' | 'GUEST' | null {
        const user: any = this.getCurrentUserValue();
        if (!user) return null;

        if (user.role === 'GUEST') return 'GUEST';
        if (user.adminId) return 'ADMIN';
        if (user.staffId) {
            const pos = (user.position || '').toUpperCase();
            if (pos === 'MANAGER') return 'MANAGER';
            if (pos === 'ADMIN') return 'ADMIN';
            return 'STAFF';
        }
        if (user.customerId) return 'CUSTOMER';

        return null;
    }
}
