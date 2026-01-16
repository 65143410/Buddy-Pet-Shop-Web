import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from "@angular/router";
import { Category } from '../category/category';
import { IconDirective } from '@ant-design/icons-angular';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf/ngFor
import { ProductService } from 'src/app/services/ProductService';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [RouterOutlet, Category, IconDirective, CommonModule]
})
export class Home implements OnInit {
  private http = inject(HttpClient);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);

  currentUser: any = null;
  recommendedProducts: any[] = [];
  // targetPetName: string = ''; // Replaced by selectedPet.petName
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
    console.log('Selected Pet:', pet);

    // Normalize Pet Type to Thai (matching DB)
    const apiPetType = this.normalizePetType(pet.petType);
    console.log('Mapped Pet Type for API:', apiPetType);

    // Fetch recommendations for the selected pet
    this.productService.getRecommendedProducts(apiPetType, pet.congenitalDisease)
      .subscribe({
        next: (products) => {
          console.log('Recommended Products for ' + pet.petName + ':', products);
          this.recommendedProducts = products;
        },
        error: (err) => console.error('Error fetching recommendations:', err)
      });
  }

  private normalizePetType(type: string): string {
    if (!type) return 'ALL';
    const t = type.trim();
    // Normalize to Thai because Database uses Thai (สุนัข, แมว)
    if (t.toUpperCase() === 'DOG' || t === 'สุนัข') return 'สุนัข';
    if (t.toUpperCase() === 'CAT' || t === 'แมว') return 'แมว';
    return t;
  }

  public addToCart(product: any): void {
    this.cartService.add(product);
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
    // Navigating to correct path based on app-routing.module.ts
    console.log('Navigating to:', ['/home/detail', id]);
    this.router.navigate(['/home/detail', id]);
  }

  trackByProductId(index: number, item: any): string | number {
    return item.productId;
  }

}
