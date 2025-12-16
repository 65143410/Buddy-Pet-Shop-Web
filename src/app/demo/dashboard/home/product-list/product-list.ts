import { ProductService } from './../services/product.service';
import { Component, inject , OnInit } from '@angular/core';
import { Router, ActivatedRoute,RouterModule} from '@angular/router';
import { CartService } from './../services/cart.service';
import { Product } from '../types/products';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-product-list',
  imports: [CommonModule,RouterModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
})
export class ProductList implements OnInit {
  public selectedCatList: Product[] = [];
  private originalCatList: Product[] = [];

route = inject(ActivatedRoute);
router = inject(Router);
cartService =inject(CartService);
productService=inject(ProductService);
  constructor(
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (!isNaN(id)) {
        const loadedList = this.productService.getCategoryItems(id);
        this.originalCatList = [...loadedList];
        this.selectedCatList = [...loadedList];
        this.selectedCatList.sort((a, b) => b.id - a.id);
    } else {
      this.selectedCatList = [];
    }
  }

  public addToCart(product: Product): void {
    this.cartService.add(product);
  }
  public onSortChange(event: Event): void {
    const sortValue = (event.target as HTMLSelectElement).value;

    switch (sortValue) {
      case 'price_asc':
        this.selectedCatList.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        this.selectedCatList.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        this.selectedCatList.sort((a, b) => b.id - a.id);
        break;
      case 'recommended':
        this.selectedCatList = [...this.originalCatList].sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    this.selectedCatList = [...this.selectedCatList];
  }
  public handleCardClick(event: MouseEvent, id: number): void {
    console.log("tsettttt");
    this.router.navigate(['/home/detail', id]);
    // [routerLink]="['/home/detail', item.id]"

        const target = event.target as HTMLElement;
        const isCartButton = target.closest('.add-to-cart-btn');

        if (isCartButton) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}

