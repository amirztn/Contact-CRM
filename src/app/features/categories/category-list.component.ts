import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-category-list',
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <h1>Categories</h1>
      <a class="btn btn-primary" routerLink="/categories/new">+ New category</a>
    </div>

    @if (error(); as message) {
      <p class="alert alert-error" role="alert">{{ message }}</p>
    }

    @if (categoryService.categories().length === 0) {
      <p class="empty">No categories yet. Create your first one.</p>
    }

    <ul class="grid">
      @for (category of categoryService.categories(); track category.id) {
        <li class="card">
          <div class="card-head">
            <span
              class="swatch"
              [style.background-color]="category.color"
              aria-hidden="true"
            ></span>
            <a [routerLink]="['/categories', category.id]"
              ><strong>{{ category.name }}</strong></a
            >
          </div>
          <p class="muted">{{ contactService.countInCategory(category.id) }} contact(s)</p>
          <div class="actions">
            <a class="btn" [routerLink]="['/categories', category.id, 'edit']">Edit</a>
            <button type="button" class="btn btn-danger" (click)="remove(category)">Delete</button>
          </div>
        </li>
      }
    </ul>
  `,
})
export class CategoryListComponent {
  protected readonly categoryService = inject(CategoryService);
  protected readonly contactService = inject(ContactService);
  protected readonly error = signal<string | null>(null);

  protected remove(category: Category): void {
    this.error.set(null);
    if (!window.confirm(`Delete the category "${category.name}"?`)) return;
    try {
      this.categoryService.delete(category.id);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Unexpected error.');
    }
  }
}
