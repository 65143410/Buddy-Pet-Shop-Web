import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const userJson = localStorage.getItem('currentUser');

    if (userJson) {
        // Optional: Check token expiry or valid roles if needed
        return true;
    }

    // Not logged in, redirect to login
    router.navigate(['/login']);
    return false;
};
