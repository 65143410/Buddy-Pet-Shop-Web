import { Component, OnInit, inject } from '@angular/core';
import { Router } from "@angular/router";
import { Category } from '../category/category';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProductService } from 'src/app/services/ProductService';
import { CartService } from 'src/app/services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [Category, CommonModule]
})
export class Home implements OnInit {
  private http = inject(HttpClient);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);

  currentUser: any = null;
  recommendedProducts: any[] = [];
  originalRecommendedProducts: any[] = [];

  allPets: any[] = [];
  selectedPet: any = null;

  temp_img_url = "https://www.prachachat.net/wp-content/uploads/2023/05/%E0%B8%94%E0%B8%B5%E0%B9%84%E0%B8%8B%E0%B8%99%E0%B9%8C%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD-6.jpg";

  constructor() { }

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
      this.loadUserPets();
    }
  }

  loadUserPets() {
    if (this.currentUser?.customerId) {
      this.http.get<any[]>(`http://localhost:8080/api/pets/customer/${this.currentUser.customerId}`)
        .subscribe(pets => {
          console.log('User Pets:', pets);
          this.allPets = pets || [];

          if (this.allPets.length > 0) {
            // Select the first pet by default
            this.onSelectPet(this.allPets[0]);
          } else {
            console.log('No pets found for user.');
          }
        });
    }
  }

  public onSelectPet(pet: any): void {
    this.selectedPet = pet;
    console.log('Selected Pet Analysis:', pet);

    const apiPetType = this.normalizePetType(pet.petType);
    const petDiseaseEnum = this.normalizeDisease(pet.congenitalDisease);

    // Filter rules:
    // 1. Must match Pet Type (or ALL)
    // 2. Must be 'NONE' (Normal food) OR match the pet's specific disease
    // 3. MUST NOT suggest food for other diseases the pet doesn't have
    this.productService.getProducts().subscribe({
      next: (allProducts) => {
        const filtered = allProducts.filter(p => {
          const typeMatch = p.targetPetType === 'ALL' || p.targetPetType === apiPetType;
          const productDisease = p.suitableForDisease || 'NONE';

          // Logic: 
          // If product is 'NONE', it's always recommended for that type.
          // If product has a disease, it must match the pet's disease.
          const diseaseMatch = (productDisease === 'NONE') || (productDisease === petDiseaseEnum);

          return typeMatch && diseaseMatch;
        });

        console.log(`Found ${filtered.length} recommended products for ${pet.petName}`);
        this.recommendedProducts = filtered.slice(0, 12); // Show top 12 matches
        this.originalRecommendedProducts = [...this.recommendedProducts];
      },
      error: (err) => console.error('Error fetching recommendations:', err)
    });
  }

  public onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();

    if (!searchTerm) {
      this.recommendedProducts = [...this.originalRecommendedProducts];
    } else {
      this.recommendedProducts = this.originalRecommendedProducts.filter(p =>
        p.productName.toLowerCase().includes(searchTerm) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    }
  }

  private normalizePetType(type: string): string {
    if (!type) return 'ALL';
    const t = type.trim();
    if (t.toUpperCase() === 'DOG' || t === 'สุนัข') return 'DOG';
    if (t.toUpperCase() === 'CAT' || t === 'แมว') return 'CAT';
    if (t.toUpperCase() === 'GUINEA_PIG' || t === 'หนูตะเภา') return 'GUINEA_PIG';
    return t;
  }

  private normalizeDisease(disease: string): string {
    if (!disease || disease === 'ไม่มี' || disease === 'NONE' || disease === 'อื่นๆ') return 'NONE';
    const dMap: { [key: string]: string } = {
      'ภูมิแพ้': 'SKIN_ALLERGY',
      'โรคผิวหนัง': 'SKIN_ALLERGY',
      'โรคไต': 'KIDNEY_DISEASE',
      'โรคอ้วน': 'OBESITY',
      'โรคข้อเสื่อม': 'JOINT_ISSUES',
      'โรคระบบทางเดินอาหาร': 'DIGESTIVE_ISSUES',
      'ควบคุมน้ำหนัก': 'WEIGHT_CONTROL',
      'โรคหัวใจ': 'NONE'
    };
    return dMap[disease] || disease;
  }

  public addToCart(product: Product): void {
    this.cartService.add(product);
  }

  public translateFormula(formula: string): string {
    const map: { [key: string]: string } = {
      'NONE': 'สุขภาพปกติ',
      'SKIN_ALLERGY': 'โรคผิวหนัง/แพ้ง่าย',
      'KIDNEY_DISEASE': 'โรคไต',
      'WEIGHT_CONTROL': 'ควบคุมน้ำหนัก',
      'OBESITY': 'โรคอ้วน',
      'JOINT_ISSUES': 'โรคข้อเสื่อม',
      'DIGESTIVE_ISSUES': 'โรคระบบทางเดินอาหาร'
    };
    return map[formula] || formula;
  }

  public handleCardClick(event: MouseEvent, id: number | string): void {
    console.log('Card clicked, ID:', id);
    const target = event.target as HTMLElement;
    const isCartButton = target.closest('.add-to-cart-btn');

    if (isCartButton) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.router.navigate(['/home/detail', id]);
  }

  trackByProductId(index: number, item: any): string | number {
    return item.productId;
  }

}
