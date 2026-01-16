import { Staff } from './demo/dashboard/staff/staff';
import { Home } from './demo/dashboard/home/home';
import { authGuard } from './auth/auth.guard';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { ProductList } from './demo/dashboard/home/product-list/product-list';
import { Admin } from './demo/dashboard/admin/admin';
import { ProductDetail } from './demo/dashboard/home/product-detail/product-detail';

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
        path: 'typography',
        loadComponent: () => import('./demo/component/basic-component/typography/typography.component').then((c) => c.TypographyComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/component/basic-component/color/color.component').then((c) => c.ColorComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'dashboard/home',
        component: Home
      },
      {
        path: 'dashboard/profile',
        loadComponent: () => import('./demo/pages/user-profile/user-profile.component').then(c => c.UserProfileComponent)
      },
      {
        path: 'dashboard/admin',
        component: Admin
      },
      {
        path: 'dashboard/staff',
        component: Staff
      },
      {
        path: 'home/product/:id',
        component: ProductList
      },
      {
        path: 'home/detail/:id',
        component: ProductDetail
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
