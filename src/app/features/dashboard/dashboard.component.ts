import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ContactService } from '../../core/services/contact.service';
import { FullNamePipe } from '../../shared/pipes/full-name.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, FullNamePipe],
  template: `
    <h1>Dashboard</h1>

    <section class="stats" aria-label="Statistics">
      <a class="stat" routerLink="/contacts"
        ><strong>{{ total() }}</strong
        ><span>Contacts</span></a
      >
      <a class="stat" routerLink="/favorites"
        ><strong>{{ favorites() }}</strong
        ><span>Favorites</span></a
      >
      <a class="stat" routerLink="/categories"
        ><strong>{{ categories() }}</strong
        ><span>Categories</span></a
      >
    </section>

    <h2>Latest additions</h2>
    @if (latest().length === 0) {
      <p class="empty">
        No contacts yet. <a routerLink="/contacts/new">Add your first contact</a>.
      </p>
    }
    <ul class="list">
      @for (c of latest(); track c.id) {
        <li>
          <a [routerLink]="['/contacts', c.id]">{{ c | fullName }}</a>
          <span class="muted">{{ c.createdAt | date: 'medium' }}</span>
        </li>
      }
    </ul>
  `,
})
export class DashboardComponent {
  private readonly contactService = inject(ContactService);
  private readonly categoryService = inject(CategoryService);

  protected readonly total = computed(() => this.contactService.contacts().length);
  protected readonly favorites = computed(() => this.contactService.favorites().length);
  protected readonly categories = computed(() => this.categoryService.categories().length);
  protected readonly latest = computed(() =>
    [...this.contactService.contacts()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
  );
}
