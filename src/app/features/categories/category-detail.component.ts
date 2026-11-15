import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ContactService } from '../../core/services/contact.service';
import { FullNamePipe } from '../../shared/pipes/full-name.pipe';

@Component({
  selector: 'app-category-detail',
  imports: [RouterLink, FullNamePipe],
  template: `
    @if (category(); as cat) {
      <div class="page-header">
        <h1>
          <span class="swatch" [style.background-color]="cat.color" aria-hidden="true"></span>
          {{ cat.name }}
        </h1>
        <a class="btn" routerLink="/categories">← Back to categories</a>
      </div>

      @if (contacts().length === 0) {
        <p class="empty">No contacts in this category.</p>
      }
      <ul class="list">
        @for (c of contacts(); track c.id) {
          <li>
            <a [routerLink]="['/contacts', c.id]">{{ c | fullName }}</a>
            <span class="muted">{{ c.email }}</span>
          </li>
        }
      </ul>
    } @else {
      <p class="alert alert-error" role="alert">Category not found.</p>
      <a class="btn" routerLink="/categories">← Back to categories</a>
    }
  `,
})
export class CategoryDetailComponent {
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly categoryService = inject(CategoryService);
  private readonly contactService = inject(ContactService);

  protected readonly category = computed(() => this.categoryService.getById(this.id));
  protected readonly contacts = computed(() =>
    this.contactService.contacts().filter((c) => c.categoryId === this.id),
  );
}
