import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { Staff, Admin as AdminInfo, Customer, Order, DashboardStat, SystemConfig, Product, Category, ProductLog } from '../../models/product.model';
import { MonthlyBarChartComponent } from 'src/app/theme/shared/apexchart/monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from 'src/app/theme/shared/apexchart/income-overview-chart/income-overview-chart.component';
import { AnalyticsChartComponent } from 'src/app/theme/shared/apexchart/analytics-chart/analytics-chart.component';
import { SalesReportChartComponent } from 'src/app/theme/shared/apexchart/sales-report-chart/sales-report-chart.component';
import { UserService } from 'src/app/services/user.service';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule, MonthlyBarChartComponent, IncomeOverviewChartComponent, AnalyticsChartComponent, SalesReportChartComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  currentPage = 'dashboard';
  staffs: Staff[] = [];
  products: Product[] = [];
  customers: Customer[] = [];
  orders: Order[] = [];
  stats: DashboardStat[] = [];
  categories: Category[] = [];
  productLogs: ProductLog[] = [];
  logsByProduct: ProductLog[] = [];
  logsCurrentPage: number = 1;
  logsPageSize: number = 10;
  modalLogsCurrentPage: number = 1;
  modalLogsPageSize: number = 5;
  ordersCurrentPage: number = 1;
  ordersPageSize: number = 10;
  selectedProductDetail: Product | null = null;
  selectedOrderDetail: Order | null = null;
  showAddStaffForm = false;
  selectedStatusFilter: string = 'ทั้งหมด';
  isLoadingLogs: boolean = false;
  isSortAscending: boolean = true;
  quantityToAdd: number = 0;
  temp_img_url = 'https://s359.kapook.com/pagebuilder/ba154685-db18-4ac7-b318-a4a2b15b9d4c.jpg';
  selectedCategory: Category | null = null;
  productSearchTerm: string = '';
  selectedProcessingYear: number = new Date().getFullYear();
  systemConfig: SystemConfig = {
    shopName: 'My Pet Store',
    vatRate: 7,
    shippingFee: 50,
    lowStockAlert: 5,
    contactEmail: 'admin@petstore.com'
  };
  selectedStaff: Staff | null = null;
  selectedCustomer: Customer | null = null;
  newStaff: Partial<Staff> = {
    name: '',
    email: '',
    password: '',
    phone: '',
    status: 'ACTIVE'
  };

  showAddProductForm = false;
  newProduct: Partial<Product> = {
    productName: '',
    price: 0,
    stock: 0,
    description: '',
    targetPetType: 'ALL',      // ✨ เพิ่ม: ค่าเริ่มต้นคือสัตว์ทุกชนิด
    suitableForDisease: 'NONE', // ✨ เพิ่ม: ค่าเริ่มต้นคือสุขภาพปกติ
    category: {
      categoryId: null
    },
    isActive: true,
    brand: '',
    weightVolume: '',
    image: ''
  };
  readonly adminAllowedStatuses = ['รอตรวจสอบยอดเงิน', 'ชำระเงินแล้ว', 'ยกเลิก/สลิปไม่ถูกต้อง'];
  private adminService = inject(AdminApiService);
  private userService = inject(UserService);

  currentRole: string | null = null;

  ngOnInit(): void {
    this.currentRole = this.userService.getUserRole();
    this.loadInitialData();
    this.loadCategories();
    this.loadProductLogs();
  }
  saveStaff(): void {
    if (!this.newStaff.name || !this.newStaff.email) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    console.log('ข้อมูลที่จะส่งไปหลังบ้าน:', this.newStaff);

    this.adminService.addStaff(this.newStaff).subscribe({
      next: (res) => {
        alert('เพิ่มพนักงานสำเร็จ!');
        this.staffs.push(res);
        this.newStaff = { name: '', email: '', status: 'ACTIVE' };
        this.showAddStaffForm = false;
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาด:', err);

        const errorMessage = err.error?.message || err.error || err.message || 'ไม่ทราบสาเหตุ';
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + errorMessage);
      }
    });
  }
  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('โหลดหมวดหมู่ไม่สำเร็จ', err)
    });
  }
  loadInitialData(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (res) => (this.stats = res),
      error: (err) => console.error('Error loading stats', err)
    });

    this.adminService.getOrders().subscribe({
      next: (res) => (this.orders = res),
      error: (err) => console.error('Error loading orders', err)
    });

    this.adminService.getStaffs().subscribe({
      next: (staffs) => {
        this.adminService.getAdmins().subscribe({
          next: (admins) => {
            const mappedAdmins: Staff[] = admins.map(a => ({
              staffId: a.adminId,
              name: a.name,
              email: a.email,
              phone: a.phone,
              position: 'ADMIN',
              status: 'ACTIVE',
              role: 'SUPER_ADMIN'
            }));

            this.staffs = [...mappedAdmins, ...staffs].map(s => {
              if (s.position) {
                s.position = s.position.toUpperCase() as any;
              }
              return s;
            });
          }
        });
      }
    });

    this.adminService.getCustomers().subscribe({ next: (res) => (this.customers = res) });
    this.adminService.getProducts().subscribe({ next: (res) => (this.products = res) });
  }
  getProductCount(categoryId: number): number {
    return this.products.filter((p) => p.category?.categoryId === categoryId).length;
  }
  setPage(page: string): void {
    this.currentPage = page;
  }
  viewStaffDetails(staff: Staff): void {
    this.selectedStaff = staff;
  }

  closeCustomerDetails() {
    this.selectedCustomer = null;
  }
  closeDetails(): void {
    this.selectedStaff = null;
  }
  customerOrderHistory: Order[] = [];
  isLoadingHistory: boolean = false;

  viewCustomerDetails(customer: Customer) {
    this.selectedCustomer = customer;
    this.viewOrderHistory(customer.customerId);
  }

  viewOrderHistory(customerId: number): void {
    this.isLoadingHistory = true;
    this.customerOrderHistory = [];
    this.adminService.getOrdersByCustomer(customerId).subscribe({
      next: (orders) => {
        this.customerOrderHistory = orders;
        this.isLoadingHistory = false;
        console.log('ข้อมูลที่ได้รับจาก API:', orders);
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoadingHistory = false;
      }
    });
  }
  confirmPayment(order: Order): void {
    if (confirm(`ยืนยันการชำระเงินสำหรับออเดอร์ #${order.orderId}?`)) {
      this.adminService.verifyOrder(order.orderId, true).subscribe({
        next: (res) => {
          alert(res.message);
          this.loadInitialData();
          this.closeOrderDetails();
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + err.error)
      });
    }
  }

  rejectPayment(order: Order): void {
    if (confirm(`ยืนยันการปฏิเสธสลิปออเดอร์ #${order.orderId}?`)) {
      this.adminService.verifyOrder(order.orderId, false).subscribe({
        next: (res) => {
          alert(res.message);
          this.loadInitialData();
          this.closeOrderDetails();
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + err.error)
      });
    }
  }
  // ของจริง
  // viewPaymentSlip(order: Order): void {
  //   if (order.payments && order.payments.length > 0) {
  //     const slip = order.payments[0].slipImage;
  //     if (slip) {
  //       const imageWindow = window.open('');
  //       const src = slip.startsWith('http') ? slip : `data:image/png;base64,${slip}`;
  //       imageWindow?.document.write(`<img src="${src}" style="max-width:100%">`);
  //     } else {
  //       alert('ไม่พบรูปภาพสลิป');
  //     }
  //   } else {
  //     alert('ยังไม่มีการแจ้งชำระเงิน');
  //   }
  // }
  viewPaymentSlip(order: Order): void {
    if (!order.payments || order.payments.length === 0) {
      alert('ยังไม่มีข้อมูลการชำระเงินสำหรับออเดอร์นี้');
      return;
    }

    const slip = order.payments[0].slipImage;
    if (!slip) {
      alert('ไม่พบรูปภาพสลิปในระบบ');
      return;
    }

    const imageWindow = window.open('', '_blank', 'width=600,height=800');
    if (imageWindow) {
      // Logic: ถ้าเป็น URL เต็มให้ใช้เลย, ถ้าเป็น Base64 ให้ใช้เลย, ถ้าเป็นชื่อไฟล์ให้ต่อ Path
      // (สมมติว่า Backend เก็บไฟล์ไว้ที่ /uploads และเปิดให้เข้าถึงผ่าน http://localhost:8080/uploads/)
      let src = slip;
      if (!slip.startsWith('http') && !slip.startsWith('data:')) {
        // Default Fallback: ลองเดาว่า Path คือ /uploads/
        // ถ้า Backend คุณใช้ Path อื่น ต้องแก้ตรงนี้ หรือใช้ Base64 จาก Backend
        src = `http://localhost:8080/uploads/${slip}`;
      }

      imageWindow.document.write(`
      <html>
        <head>
          <title>ตรวจสอบหลักฐานการชำระเงิน #${order.orderId}</title>
          <style>
            body { margin: 0; background: #f4f4f9; display: flex; flex-direction: column; align-items: center; font-family: sans-serif; padding: 20px; }
            img { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .btn { margin-top: 20px; padding: 10px 20px; cursor: pointer; background: #6366f1; color: white; border: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h2>หลักฐานการชำระเงิน (Order #${order.orderId})</h2>
          <img src="${src}" alt="Slip Image" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Image+Not+Found'; alert('ไม่สามารถโหลดรูปได้ URL อาจไม่ถูกต้อง');">
          <p style="margin-top:10px; color:#666;">File Ref: ${slip}</p>
          <button class="btn" onclick="window.print()">พิมพ์หลักฐาน</button>
        </body>
      </html>
    `);
      imageWindow.document.close();
    }
  }

  updateStatus(order: Order): void {
    const newStatus = order.status.statusName;

    if (newStatus === 'ชำระเงินแล้ว') {
      this.confirmPayment(order);
    } else if (newStatus === 'ยกเลิก/สลิปไม่ถูกต้อง') {
      this.rejectPayment(order);
    } else if (newStatus === 'รอตรวจสอบยอดเงิน') {
      alert('เปลี่ยนสถานะเป็น: รอตรวจสอบยอดเงิน');
    }
  }
  assignStaffToOrder(orderId: number, staffId: number): void {
    this.adminService.acceptOrder(orderId, staffId).subscribe({
      next: () => {
        alert('รับงานเรียบร้อย');
        this.loadInitialData();
      }
    });
  }

  toggleStaffStatus(staff: Staff): void {
    // ✨ เพิ่มการตรวจสอบสิทธิ์สำหรับ MANAGER
    if (this.currentRole === 'MANAGER' && staff.position === 'ADMIN') {
      alert('ขออภัย: ในฐานะ Manager คุณไม่มีสิทธิ์เปลี่ยนสถานะ (ระงับ/เปิด) ของผู้ดูแลระบบ (ADMIN) ได้ครับ');
      return;
    }

    const newStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.adminService.updateStaffStatus(staff.staffId, newStatus).subscribe({
      next: (msg) => {
        staff.status = newStatus;
        alert(msg);
      }
    });
  }

  saveSettings(): void {
    this.adminService.saveSettings(this.systemConfig).subscribe({
      next: () => alert('บันทึกสำเร็จ')
    });
  }
  updateStockValue(product: Product): void {
    if (product.stock < 0) {
      alert('จำนวนสต็อกไม่สามารถติดลบได้');
      return;
    }
    this.adminService.updateProduct(product.productId, product).subscribe({
      next: (res) => {
        console.log('Stock updated for:', product.productName);
        product.stock = res.stock;
        this.fetchLogsForProduct(product.productId);
        this.loadProductLogs();
        alert('อัปเดตสต็อกสำเร็จ!');
      },
      error: (err) => {
        alert('ไม่สามารถอัปเดตสต็อกได้: ' + (err.error?.message || 'Server Error'));
        this.loadInitialData();
      }
    });
  }
  deleteProductData(product: Product): void {
    if (confirm(`คุณต้องการลบ "${product.productName}" ใช่หรือไม่?`)) {
      this.adminService.deleteProduct(product.productId).subscribe({
        next: () => {
          this.products = this.products.filter((p) => p.productId !== product.productId);

          this.loadProductLogs();

          alert('ลบสินค้าสำเร็จ!');
          this.closeProductDetails();
        },
        error: (err) => {
          alert('ลบไม่สำเร็จ: ' + (err.error?.message || 'Server Error'));
        }
      });
    }
  }
  saveProduct(): void {
    if (!this.newProduct.category.categoryId) {
      alert('กรุณาเลือกประเภทสินค้า');
      return;
    }

    this.adminService.addProduct(this.newProduct).subscribe({
      next: (res) => {
        alert('เพิ่มสินค้าสำเร็จ!');
        this.products.push(res);
        this.resetProductForm();
        this.showAddProductForm = false;
      },
      error: (err) => {
        console.error('Error 400 Details:', err.error);
        alert('บันทึกไม่สำเร็จ: ' + (err.error?.message || 'ข้อมูลไม่ถูกต้อง'));
      }
    });
  }

  resetProductForm(): void {
    this.newProduct = {
      productName: '',
      price: 0,
      stock: 0,
      description: '',
      category: { categoryId: null }
    };
  }
  selectCategory(cat: Category): void {
    this.selectedCategory = cat;
    this.newProduct.category = { categoryId: cat.categoryId };
  }
  backToCategories(): void {
    this.selectedCategory = null;
    this.showAddProductForm = false;
    this.productSearchTerm = '';
  }

  get filteredProducts(): Product[] {
    if (!this.selectedCategory) return [];
    let list = this.products.filter((p) => p.category?.categoryId === this.selectedCategory?.categoryId);
    if (this.productSearchTerm.trim()) {
      const term = this.productSearchTerm.toLowerCase().trim();
      list = list.filter(p => p.productName.toLowerCase().includes(term));
    }
    return list;
  }
  countProductsInCategory(categoryId: number): number {
    return this.products.filter((p) => p.category?.categoryId === categoryId).length;
  }

  addCategory(): void {
    const name = window.prompt('กรุณากรอกชื่อประเภทสินค้าใหม่:');
    if (name && name.trim()) {
      this.adminService.addCategory({ categoryName: name.trim() }).subscribe({
        next: (res) => {
          alert('เพิ่มประเภทสินค้าสำเร็จ!');
          this.loadCategories();
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
      });
    }
  }

  deleteCategory(event: Event, cat: Category): void {
    event.stopPropagation(); // ป้องกันการเลือกประเภทสินค้า

    const productCount = this.getProductCount(cat.categoryId);
    if (productCount > 0) {
      alert(`ไม่สามารถลบประเภทสินค้า "${cat.categoryName}" ได้ เนื่องจากมีสินค้าอยู่ในประเภทนี้ ${productCount} รายการ`);
      return;
    }

    if (confirm(`คุณต้องการลบประเภทสินค้า "${cat.categoryName}" ใช่หรือไม่?`)) {
      this.adminService.deleteCategory(cat.categoryId).subscribe({
        next: () => {
          alert('ลบประเภทสินค้าสำเร็จ!');
          this.loadCategories();
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
      });
    }
  }

  editCategory(event: Event, cat: Category): void {
    event.stopPropagation();
    const newName = window.prompt('แก้ไขชื่อประเภทสินค้า:', cat.categoryName);
    if (newName && newName.trim() && newName.trim() !== cat.categoryName) {
      this.adminService.updateCategory(cat.categoryId, { categoryName: newName.trim() }).subscribe({
        next: () => {
          alert('แก้ไขประเภทสินค้าสำเร็จ!');
          this.loadCategories();
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
      });
    }
  }

  loadProductLogs() {
    this.isLoadingLogs = true;
    this.adminService.getProductLogs().subscribe({
      next: (data) => {
        this.productLogs = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        this.isLoadingLogs = false;
      },
      error: (err) => {
        console.error('โหลดประวัติไม่สำเร็จ:', err);
        this.isLoadingLogs = false;
      }
    });
  }

  get paginatedProductLogs(): ProductLog[] {
    const start = (this.logsCurrentPage - 1) * this.logsPageSize;
    return this.productLogs.slice(start, start + this.logsPageSize);
  }

  get logsTotalPages(): number {
    return Math.ceil(this.productLogs.length / this.logsPageSize);
  }

  changeLogsPage(page: number): void {
    if (page >= 1 && page <= this.logsTotalPages) {
      this.logsCurrentPage = page;
    }
  }

  get paginatedModalLogs(): ProductLog[] {
    const start = (this.modalLogsCurrentPage - 1) * this.modalLogsPageSize;
    return this.logsByProduct.slice(start, start + this.modalLogsPageSize);
  }

  get modalLogsTotalPages(): number {
    return Math.ceil(this.logsByProduct.length / this.modalLogsPageSize);
  }

  changeModalLogsPage(page: number): void {
    if (page >= 1 && page <= this.modalLogsTotalPages) {
      this.modalLogsCurrentPage = page;
    }
  }

  viewProductDetails(product: Product): void {
    this.selectedProductDetail = product;
    this.modalLogsCurrentPage = 1;
    this.isLoadingLogs = true;
    this.logsByProduct = [];
    this.adminService.getProductLogsById(product.productId).subscribe({
      next: (logs) => {
        this.logsByProduct = logs;
        this.isLoadingLogs = false;
      },
      error: (err) => {
        console.error('Error loading product logs', err);
        this.isLoadingLogs = false;
      }
    });
  }

  confirmAddStock(): void {
    if (this.selectedProductDetail && this.quantityToAdd > 0) {
      const originalStock = this.selectedProductDetail.stock;
      this.selectedProductDetail.stock = originalStock + this.quantityToAdd;
      this.updateStockValue(this.selectedProductDetail);

      this.quantityToAdd = 0;
    } else {
      alert('กรุณากรอกจำนวนที่ต้องการเพิ่ม (ต้องมากกว่า 0)');
    }
  }

  confirmRemoveStock(): void {
    if (this.selectedProductDetail && this.quantityToAdd > 0) {
      const originalStock = this.selectedProductDetail.stock;
      if (originalStock < this.quantityToAdd) {
        alert('จำนวนสต็อกคงเหลือไม่พอสำหรับการลด');
        return;
      }
      this.selectedProductDetail.stock = originalStock - this.quantityToAdd;
      this.updateStockValue(this.selectedProductDetail);
      this.quantityToAdd = 0;
    } else {
      alert('กรุณากรอกจำนวนที่ต้องการลด (ต้องมากกว่า 0)');
    }
  }

  closeProductDetails(): void {
    this.selectedProductDetail = null;
    this.logsByProduct = [];
  }

  fetchLogsForProduct(productId: number) {
    this.isLoadingLogs = true;
    this.adminService.getProductLogsById(productId).subscribe({
      next: (logs) => {
        this.logsByProduct = logs;
        this.isLoadingLogs = false;
      },
      error: () => (this.isLoadingLogs = false)
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrderDetail = order;
  }

  closeOrderDetails(): void {
    this.selectedOrderDetail = null;
  }

  get paginatedOrders() {
    const list = this.filteredOrders;
    const start = (this.ordersCurrentPage - 1) * this.ordersPageSize;
    return list.slice(start, start + this.ordersPageSize);
  }

  get ordersTotalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.ordersPageSize);
  }

  changeOrdersPage(page: number): void {
    if (page >= 1 && page <= this.ordersTotalPages) {
      this.ordersCurrentPage = page;
    }
  }

  setStatusFilter(status: string): void {
    this.selectedStatusFilter = status;
    this.ordersCurrentPage = 1;
  }

  get filteredOrders() {
    if (this.selectedStatusFilter === 'ทั้งหมด') {
      return this.orders;
    }
    return this.orders.filter((o) => o.status.statusName === this.selectedStatusFilter);
  }

  sortByStatus(): void {
    this.isSortAscending = !this.isSortAscending;
    this.orders.sort((a, b) => {
      const statusA = a.status.statusName.toLowerCase();
      const statusB = b.status.statusName.toLowerCase();
      if (this.isSortAscending) {
        return statusA.localeCompare(statusB);
      } else {
        return statusB.localeCompare(statusA);
      }
    });
  }

  saveStaffChanges(staff: Staff | null): void {
    if (!staff) return;

    if (this.currentRole === 'MANAGER') {
      const originalStaff = this.staffs.find(s => s.staffId === staff.staffId);
      if (originalStaff && originalStaff.position === 'ADMIN') {
        alert('ขออภัย: ในฐานะ Manager คุณไม่มีสิทธิ์แก้ไขข้อมูลหรือตำแหน่งของผู้ดูแลระบบ (ADMIN) ได้ครับ');
        this.loadInitialData();
        this.selectedStaff = null;
        return;
      }
    }

    const cleanData: any = {
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      position: staff.position,
      status: staff.status
    };

    if (staff.password) {
      cleanData.password = staff.password;
    }

    if (staff.role === 'SUPER_ADMIN') {
      const adminData: AdminInfo = {
        adminId: staff.staffId,
        ...cleanData
      };
      this.adminService.updateAdmin(adminData).subscribe({
        next: () => {
          alert('บันทึกข้อมูลผู้ดูแลระบบสำเร็จ!');
          this.loadInitialData();
          this.selectedStaff = null;
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
      });
    } else {
      const staffData: any = {
        staffId: staff.staffId,
        ...cleanData
      };
      this.adminService.updateStaff(staffData).subscribe({
        next: () => {
          alert('บันทึกข้อมูลพนักงานสำเร็จ!');
          this.loadInitialData();
          this.selectedStaff = null;
        },
        error: (err) => alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.message))
      });
    }
  }

  saveShippingInfo(order: Order): void {
    if (!order || !order.orderId) return;

    this.adminService.updateOrderShippingInfo(order.orderId, order.trackingNumber || '', order.shippingCost || 0)
      .subscribe({
        next: (updatedOrder) => {
          alert('บันทึกข้อมูลการจัดส่งสำเร็จ!');
          this.selectedOrderDetail = updatedOrder;
          const index = this.orders.findIndex(o => o.orderId === updatedOrder.orderId);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
          }
        },
        error: (err) => {
          alert('บันทึกไม่สำเร็จ: ' + (err.error?.message || 'Server Error'));
        }
      });
  }

  exportReport(): void {
    window.print();
  }

  exportToExcel(): void {
    this.adminService.getMonthlySales().subscribe({
      next: (monthlyData) => {
        this.adminService.getDailyRevenue().subscribe({
          next: (dailyData) => {
            this.generateFullExcel(monthlyData, dailyData);
          },
          error: () => this.generateFullExcel(monthlyData, [])
        });
      },
      error: () => this.generateFullExcel([], [])
    });
  }

  async generateFullExcel(monthlySales: any[], dailyRevenue: any[]) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Buddy PetShop System';
    workbook.created = new Date();

    const chartSheet = workbook.addWorksheet('Dashboard Visuals');
    chartSheet.addRow(['Dashboard Report', new Date().toLocaleString()]);
    chartSheet.addRow(['Graphs & Charts Snapshot']);
    chartSheet.addRow([]);

    const chartIds = ['monthlyChartContainer', 'incomeChartContainer', 'analyticsChartContainer', 'salesReportChartContainer'];
    const chartTitles = ['Monthly Sales', 'Income Overview', 'Analytics', 'Sales Distribution'];

    let currentRow = 4;

    for (let i = 0; i < chartIds.length; i++) {
      const id = chartIds[i];
      const element = document.getElementById(id);
      if (element) {
        try {
          const canvas = await html2canvas(element, { scale: 2 });
          const base64 = canvas.toDataURL('image/png');

          const imageId = workbook.addImage({
            base64: base64,
            extension: 'png',
          });

          chartSheet.addRow([chartTitles[i]]);
          chartSheet.addImage(imageId, {
            tl: { col: 0, row: currentRow },
            ext: { width: 500, height: 300 }
          });

          currentRow += 16;
          for (let r = 0; r < 15; r++) chartSheet.addRow([]);

        } catch (e) {
          console.error(`Error capturing chart ${id}`, e);
          chartSheet.addRow([`Error capturing ${chartTitles[i]}`]);
        }
      }
    }

    // --- Sheet: Annual Sales Report (Selection Based) ---
    const annualSheet = workbook.addWorksheet(`Annual Report ${this.selectedProcessingYear}`);
    annualSheet.addRow([`Annual Sales Report for Year ${this.selectedProcessingYear}`]);
    annualSheet.addRow([`Exported on: ${new Date().toLocaleString()}`]);
    annualSheet.addRow([]);
    annualSheet.addRow(['Metric', 'Value']);
    annualSheet.addRow(['Total Revenue (Verified)', this.yearlyTotal]);
    annualSheet.addRow(['Total Orders', this.yearlyOrderCount]);
    annualSheet.addRow(['Average Order Value', this.yearlyAvgOrder]);
    annualSheet.addRow(['Best Performance Month', this.topMonthName]);
    annualSheet.addRow([]);
    annualSheet.addRow(['Monthly Performance Breakdown']);
    annualSheet.addRow(['Month', 'Revenue (THB)']);

    const monthsArr = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const salesByMonth = new Array(12).fill(0);
    this.currentYearOrders.forEach(o => {
      const m = new Date(o.orderDate).getMonth();
      salesByMonth[m] += (o.totalAmount || 0);
    });
    monthsArr.forEach((mName, idx) => {
      annualSheet.addRow([mName, salesByMonth[idx]]);
    });

    // Styling the annual sheet
    annualSheet.getColumn(1).width = 25;
    annualSheet.getColumn(2).width = 20;

    const summarySheet = workbook.addWorksheet('Executive Summary');
    const totalRevenue = this.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = this.orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalCustomers = this.customers.length;

    summarySheet.addRow(['KPI', 'Value']);
    summarySheet.addRow(['Total Revenue', totalRevenue]);
    summarySheet.addRow(['Total Orders', totalOrders]);
    summarySheet.addRow(['Avg. Order Value', avgOrderValue]);
    summarySheet.addRow(['Total Customers', totalCustomers]);
    summarySheet.addRow([]);
    summarySheet.addRow(['System Stats']);
    this.stats.forEach(s => summarySheet.addRow([s.label, s.value]));

    const monthlySheet = workbook.addWorksheet('Monthly Sales Data');
    monthlySheet.addRow(['Month', 'Sales Amount', 'Order Count']);
    monthlySales.forEach(m => monthlySheet.addRow([m.month || m.label, m.totalSales || m.value, m.orderCount || 0]));

    const topSheet = workbook.addWorksheet('Top Sellers');
    topSheet.addRow(['Rank', 'Item Name', 'Revenue']);
    const productSalesMap = new Map<string, number>();
    this.orders.forEach(o => o.orderDetails?.forEach(d => {
      const name = d.product?.productName || 'Unknown';
      productSalesMap.set(name, (productSalesMap.get(name) || 0) + (d.unitPrice * d.quantity));
    }));
    const topProducts = Array.from(productSalesMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

    topProducts.forEach((p, idx) => topSheet.addRow([idx + 1, p[0], p[1]]));

    const orderSheet = workbook.addWorksheet('All Orders');
    orderSheet.addRow(['Order ID', 'Date', 'Customer', 'Total', 'Status']);
    this.orders.forEach(o => orderSheet.addRow([
      o.orderId, o.orderDate, o.customer?.customerName, o.totalAmount, o.status?.statusName
    ]));

    const buffer = await workbook.xlsx.writeBuffer();
    this.saveAsExcelFile(buffer, 'BuddyPetShop_Full_Report');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });

    const date = new Date();
    const dateStamp = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    saveAs(data, fileName + '_' + dateStamp + EXCEL_EXTENSION);
  }

  getOrderCountByStatus(statusName: string): number {
    if (statusName === 'ทั้งหมด') return this.orders.length;
    return this.orders.filter(o => o.status?.statusName === statusName).length;
  }

  get currentYearOrders(): Order[] {
    const revenueStatuses = ['ชำระเงินแล้ว', 'กำลังจัดเตรียมสินค้า', 'จัดส่งแล้ว', 'สำเร็จ'];
    return this.orders.filter(o => {
      const orderYear = new Date(o.orderDate).getFullYear();
      return orderYear === this.selectedProcessingYear && revenueStatuses.includes(o.status?.statusName || '');
    });
  }

  get yearlyTotal(): number {
    return this.currentYearOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  get yearlyOrderCount(): number {
    return this.currentYearOrders.length;
  }

  get yearlyAvgOrder(): number {
    return this.yearlyOrderCount > 0 ? this.yearlyTotal / this.yearlyOrderCount : 0;
  }

  get topMonthName(): string {
    const monthSales = new Array(12).fill(0);
    this.currentYearOrders.forEach(o => {
      const month = new Date(o.orderDate).getMonth();
      monthSales[month] += (o.totalAmount || 0);
    });

    const maxSales = Math.max(...monthSales);
    if (maxSales === 0) return '-';

    const topMonthIdx = monthSales.indexOf(maxSales);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return months[topMonthIdx];
  }

  get availableYears(): number[] {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    this.orders.forEach(o => {
      const y = new Date(o.orderDate).getFullYear();
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }

  selectYear(year: number): void {
    this.selectedProcessingYear = year;
  }
}
// Import at top (simulated here for clarity, but I will add real imports at file top)
