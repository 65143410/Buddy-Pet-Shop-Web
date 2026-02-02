import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-staff-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './staff-profile.component.html',
    styleUrls: ['./staff-profile.component.scss']
})
export class StaffProfileComponent implements OnInit {
    currentUser: any = null;
    isEditMode = false;
    editUser: any = {};

    userService = inject(UserService);
    router = inject(Router);
    http = inject(HttpClient);
    sanitizer = inject(DomSanitizer);

    ngOnInit() {
        this.userService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (this.currentUser) {
                this.editUser = { ...this.currentUser };
            }
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        if (this.isEditMode) {
            this.editUser = { ...this.currentUser };
        }
    }

    saveProfile() {
        let obs;

        // --- ลบฟังก์ชัน cleanImage ออก หรือไม่ต้องเรียกใช้ ---
        // ส่ง string ยาวๆ ไปทั้งดุ้นเลย เพื่อเก็บ MIME Type ไว้
        const imageToSend = this.editUser.image;

        if (this.currentUser.staffId) {
            const updateData = {
                ...this.currentUser,
                name: this.editUser.name,
                email: this.editUser.email,
                phone: this.editUser.phone,
                image: imageToSend,
            };
            obs = this.http.put(`http://localhost:8080/api/staff/${this.currentUser.staffId}`, updateData);
        } else if (this.currentUser.adminId) {
            const updateData = {
                ...this.currentUser,
                name: this.editUser.name,
                email: this.editUser.email,
                phone: this.editUser.phone,
                image: imageToSend
            };
            obs = this.http.put(`http://localhost:8080/api/admin/${this.currentUser.adminId}`, updateData);
        }

        if (!obs) return;

        obs.subscribe({
            next: (res: any) => {
                alert('บันทึกข้อมูลสำเร็จ!');
                this.isEditMode = false;
                // Update local storage and observable
                this.userService.updateUser(res);

                // Optional: Force re-sync from server to be 100% sure
                this.refreshCurrentUserData();
            },
            error: (err) => {
                console.error('Update Error:', err);
                alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message));
            }
        });
    }

    refreshCurrentUserData() {
        if (this.currentUser.staffId) {
            this.http.get(`http://localhost:8080/api/staff/${this.currentUser.staffId}`).subscribe((res: any) => {
                this.userService.updateUser(res);
            });
        } else if (this.currentUser.adminId) {
            this.http.get(`http://localhost:8080/api/admin/${this.currentUser.adminId}`).subscribe((res: any) => {
                this.userService.updateUser(res);
            });
        }
    }

    logout() {
        this.userService.logout();
        this.router.navigate(['/login']);
    }

    getProfileImage(): SafeUrl | string {
        let img = this.isEditMode ? this.editUser?.image : this.currentUser?.image;
        if (!img) return 'assets/images/user/avatar-2.jpg';

        // ถ้ามี http (รูปจากเน็ต) หรือมี data: (รูป Base64 ที่ถูกต้อง) ให้แสดงเลย
        if (img.startsWith('http') || img.startsWith('data:')) {
            return this.sanitizer.bypassSecurityTrustUrl(img);
        }

        // Fallback: กรณีข้อมูลเก่าใน DB ที่ไม่มี Header (ที่คุณเคยตัดทิ้งไปแล้ว)
        // ค่อยเติม header ให้ (เสี่ยงดวงว่าเป็น jpeg)
        return this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${img}`);
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            // เช็คขนาดไฟล์ (ตัวอย่าง: ห้ามเกิน 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB');
                event.target.value = ''; // ล้างค่าออก
                return;
            }

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.editUser.image = e.target.result; // เก็บทั้ง data:image/...,base64,...
            };
            reader.readAsDataURL(file);
        }
    }
}
