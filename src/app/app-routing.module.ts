import { Staff } from './demo/dashboard/staff/staff';
import { Home } from './demo/dashboard/home/home';
import { authGuard } from './auth/auth.guard';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { ProductList } from './demo/dashboard/product-list/product-list';
import { Admin } from './demo/dashboard/admin/admin';
import { ProductDetail } from './demo/dashboard/product-detail/product-detail';

export const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [authGuard], // Protect all children routes
    children: [
      {
        path: '',
        redirectTo: '/dashboard/home',
        pathMatch: 'full'
      },

      {
        path: 'sample-page',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'dashboard/home',
        component: Home,
        data: { roles: ['CUSTOMER', 'GUEST'] }
      },
      {
        path: 'dashboard/profile',
        loadComponent: () => import('./demo/pages/user-profile/user-profile.component').then(c => c.UserProfileComponent),
        data: { roles: ['CUSTOMER'] }
      },
      {
        path: 'dashboard/staff-profile',
        loadComponent: () => import('./demo/pages/staff-profile/staff-profile.component').then(c => c.StaffProfileComponent),
        data: { roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'dashboard/admin',
        component: Admin,
        data: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'dashboard/staff',
        component: Staff,
        data: { roles: ['STAFF'] }
      },
      {
        path: 'home/product/:id',
        component: ProductList,
        data: { roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER', 'GUEST'] }
      },
      {
        path: 'home/detail/:id',
        component: ProductDetail,
        data: { roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER', 'GUEST'] }
      },
    ]
  },

  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
