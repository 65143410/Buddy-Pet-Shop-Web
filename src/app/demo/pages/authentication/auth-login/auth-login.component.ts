import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/authservice';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent {
  router = inject(Router);
  authService = inject(AuthService);
  userService = inject(UserService);

  isLoading = false;
  errorMessage = '';

  // สร้าง Object ให้ตรงกับ LoginRequest ใน Backend (AuthController.java)
  loginRequest = {
    email: '',
    password: ''
  };

  onLogin() {
    this.errorMessage = '';

    if (!this.loginRequest.email || !this.loginRequest.password) {
      this.errorMessage = 'กรุณากรอกอีเมลและรหัสผ่าน';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginRequest).subscribe({
      next: (user) => {
        console.log('Login success:', user);
        this.userService.updateUser(user); // Use UserService to update state
        this.isLoading = false;
        this.router.navigate(['/dashboard/home']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      }
    });
  }
}