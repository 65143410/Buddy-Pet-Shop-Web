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
        if (this.currentUser.staffId) {
            const updateData = {
                staffId: this.currentUser.staffId,
                name: this.editUser.name,
                email: this.editUser.email,
                phone: this.editUser.phone,
                image: this.editUser.image,
                position: this.currentUser.position,
                status: this.currentUser.status
            };
            obs = this.http.put(`http://localhost:8080/api/staff/${this.currentUser.staffId}`, updateData);
        } else if (this.currentUser.adminId) {
            const updateData = {
                adminId: this.currentUser.adminId,
                name: this.editUser.name,
                email: this.editUser.email,
                phone: this.editUser.phone,
                image: this.editUser.image
            };
            obs = this.http.put(`http://localhost:8080/api/admin/${this.currentUser.adminId}`, updateData);
        }

        if (!obs) return;

        obs.subscribe({
            next: (res: any) => {
                alert('บันทึกข้อมูลสำเร็จ!');
                this.isEditMode = false;
                this.userService.updateUser(res);
            },
            error: (err) => {
                console.error('Update Error:', err);
                alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message));
            }
        });
    }

    logout() {
        this.userService.logout();
        this.router.navigate(['/login']);
    }

    getProfileImage(): SafeUrl | string {
        let img = this.currentUser?.image;
        if (!img) return 'assets/images/user/avatar-2.jpg';

        img = img.replace(/[\n\r\s]/g, '');

        if (img.startsWith('http')) {
            return this.sanitizer.bypassSecurityTrustUrl(img);
        }

        if (img.startsWith('data:')) {
            if (img.includes('base64') && !img.includes('base64,')) {
                img = img.replace('base64', 'base64,');
            }
            return this.sanitizer.bypassSecurityTrustUrl(img);
        }

        return this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${img}`);
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.editUser.image = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
}
