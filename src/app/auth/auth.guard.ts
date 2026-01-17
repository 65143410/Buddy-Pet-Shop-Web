import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const userService = inject(UserService);
    const userRole = userService.getUserRole();

    // 1. ตรวจสอบว่าล็อกอินหรือยัง
    if (!userRole) {
        router.navigate(['/login']);
        return false;
    }

    // 2. ตรวจสอบสิทธิ์ที่ระบุใน Route Data
    const requiredRoles = route.data['roles'] as Array<string>;

    // ถ้าไม่มีการระบุสิทธิ์ที่ต้องการ ให้ผ่านได้ (สำหรับหน้ากลางๆ)
    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    // ถ้ามีสิทธิ์ที่ระบุ ให้เช็คว่าสิทธิ์ปัจจุบันของผู้ใช้ตรงกันไหม
    if (requiredRoles.includes(userRole)) {
        return true;
    }

    // 3. ถ้าไม่มีสิทธิ์ ให้ดีดกลับไปยังหน้าหลักของสิทธิ์นั้นๆ
    console.warn(`Access denied for role: ${userRole} at path: ${state.url}`);

    if (userRole === 'ADMIN') {
        router.navigate(['/dashboard/admin']);
    } else if (userRole === 'STAFF') {
        router.navigate(['/dashboard/staff']);
    } else {
        router.navigate(['/dashboard/home']);
    }

    return false;
};
