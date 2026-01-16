import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/authservice';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-register',
  imports: [RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.scss'
})
export class AuthRegisterComponent {
  router = inject(Router);
  private http = inject(HttpClient);
  goToHome() {
    this.router.navigate(['dashboard/home'])
  }
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService) { }
  registerData = {
    customerName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    image: '',
    petName: '',
    petType: 'DOG',
    congenitalDisease: 'ไม่มี',
    petBirthdate: '',
    petWeight: 0,
    petGender: 'MALE',
    petBreed: '',
    petImage: '',
    petIsSterilized: false
  };

  diseases = ['ไม่มี', 'ภูมิแพ้', 'โรคผิวหนัง', 'โรคหัวใจ', 'โรคไต', 'โรคอ้วน', 'โรคข้อเสื่อม', 'โรคระบบทางเดินอาหาร', 'อื่นๆ'];

  onFileSelected(event: any, field: 'image' | 'petImage') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.registerData[field] = e.target.result; // Base64 string
      };
      reader.readAsDataURL(file);
    }
  }

  onRegister() {
    this.errorMessage = '';

    if (!this.registerData.email || !this.registerData.password || !this.registerData.customerName) {
      this.errorMessage = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ, อีเมล, รหัสผ่าน)';
      return;
    }

    this.isLoading = true;

    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.isLoading = false;
        alert('สมัครสมาชิกสำเร็จ!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      }
    });
  }
}

