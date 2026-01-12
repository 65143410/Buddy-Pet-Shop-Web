import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { Staff, Customer, Order, DashboardStat, SystemConfig, Product, Category, ProductLog } from '../../models/product.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  selectedProductDetail: Product | null = null;
  selectedOrderDetail: Order | null = null;
  showAddStaffForm = false;
  selectedStatusFilter: string = 'ทั้งหมด';
  isLoadingLogs: boolean = false;
  isSortAscending: boolean = true;
  quantityToAdd: number = 0;
  temp_img_url = 'https://s359.kapook.com/pagebuilder/ba154685-db18-4ac7-b318-a4a2b15b9d4c.jpg';
  selectedCategory: Category | null = null;
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
    }
  };
  readonly adminAllowedStatuses = ['รอตรวจสอบยอดเงิน', 'ชำระเงินแล้ว', 'ยกเลิก/สลิปไม่ถูกต้อง'];
  private adminService = inject(AdminApiService);

  ngOnInit(): void {
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

    this.adminService.getStaffs().subscribe({ next: (res) => (this.staffs = res) });
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
  viewPaymentSlip(): void {
    const imageWindow = window.open('', '_blank', 'width=600,height=800');

    if (imageWindow) {
      const src = this.temp_img_url;

      imageWindow.document.write(`
      <html>
        <head>
          <title>ตรวจสอบหลักฐานการชำระเงิน</title>
          <style>
            body {
              margin: 0;
              background-color: #f4f4f9;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-family: 'Inter', sans-serif;
              padding: 20px;
            }
            .header {
              width: 100%;
              max-width: 500px;
              text-align: center;
              margin-bottom: 20px;
              color: #333;
            }
            .slip-container {
              background: white;
              padding: 15px;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              max-width: 90%;
            }
            img {
              max-width: 100%;
              border-radius: 8px;
              display: block;
            }
            .btn-print {
              margin-top: 20px;
              padding: 10px 25px;
              background-color: #6366f1;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
            }
            .btn-print:hover { background-color: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🐾 PetStore Admin</h2>
            <p>หลักฐานการชำระเงิน (Mockup)</p>
          </div>
          <div class="slip-container">
            <img src="${src}" alt="Slip">
          </div>
          <button class="btn-print" onclick="window.print()">🖨️ พิมพ์หลักฐาน</button>
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
  }

  get filteredProducts(): Product[] {
    if (!this.selectedCategory) return [];
    return this.products.filter((p) => p.category?.categoryId === this.selectedCategory?.categoryId);
  }
  countProductsInCategory(categoryId: number): number {
    return this.products.filter((p) => p.category?.categoryId === categoryId).length;
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
  viewProductDetails(product: Product): void {
    this.selectedProductDetail = product;
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
    if (!staff || !staff.staffId) return;

    this.adminService.updateStaff(staff).subscribe({
      next: () => {
        alert('บันทึกข้อมูลพนักงานสำเร็จ!');
        this.loadInitialData();
        this.selectedStaff = null;
      },
      error: (err) => alert('เกิดข้อผิดพลาด: ' + err.message)
    });
  }
}
