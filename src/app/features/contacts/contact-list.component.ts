import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Category } from '../../core/models/category.model';
import { Contact } from '../../core/models/contact.model';
import { CategoryService } from '../../core/services/category.service';
import { ContactService } from '../../core/services/contact.service';
import { FullNamePipe } from '../../shared/pipes/full-name.pipe';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

type SortOption = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc';

@Component({
  selector: 'app-contact-list',
  imports: [RouterLink, FullNamePipe, InitialsPipe],
  template: `
    <div class="page-header">
      <h1>{{ favoritesPage ? 'Favorites' : 'Contacts' }}</h1>
      <a class="btn btn-primary" routerLink="/contacts/new">+ New contact</a>
    </div>

    <div class="toolbar" role="search">
      <input
        #q
        type="search"
        placeholder="Search by name…"
        aria-label="Search contacts by name"
        [value]="search()"
        (input)="search.set(q.value)"
      />

      <select #cat aria-label="Filter by category" (change)="categoryFilter.set(cat.value)">
        <option value="all" [selected]="categoryFilter() === 'all'">All categories</option>
        @for (c of categoryService.categories(); track c.id) {
          <option [value]="c.id" [selected]="categoryFilter() === c.id">{{ c.name }}</option>
        }
      </select>

      <select #sortSel aria-label="Sort contacts" (change)="sort.set($any(sortSel.value))">
        <option value="name-asc">Name A–Z</option>
        <option value="name-desc">Name Z–A</option>
        <option value="date-desc">Newest first</option>
        <option value="date-asc">Oldest first</option>
      </select>

      @if (!favoritesPage) {
        <label class="checkbox">
          <input
            #fav
            type="checkbox"
            [checked]="favoritesOnly()"
            (change)="favoritesOnly.set(fav.checked)"
          />
          Favorites only
        </label>
      }
    </div>

    <p class="muted" aria-live="polite">{{ contacts().length }} contact(s)</p>

    @if (contacts().length === 0) {
      <p class="empty">No contacts match your criteria.</p>
    }

    <ul class="grid">
      @for (c of contacts(); track c.id) {
        <li class="card">
          <div class="card-head">
            <span class="avatar" aria-hidden="true">{{ c | initials }}</span>
            <div>
              <a [routerLink]="['/contacts', c.id]"
                ><strong>{{ c | fullName }}</strong></a
              >
              <div class="muted">
                {{ c.jobTitle }}{{ c.jobTitle && c.company ? ' · ' : '' }}{{ c.company }}
              </div>
            </div>
          </div>
          <p>{{ c.email }}<br />{{ c.phone }}</p>
          @if (categoryOf(c); as category) {
            <span class="badge" [style.background-color]="category.color">{{ category.name }}</span>
          }
          <div class="actions">
            <button
              type="button"
              class="btn"
              [attr.aria-pressed]="c.favorite"
              (click)="toggleFavorite(c)"
            >
              {{ c.favorite ? '★ Favorite' : '☆ Favorite' }}
            </button>
            <a class="btn" [routerLink]="['/contacts', c.id, 'edit']">Edit</a>
            <button type="button" class="btn btn-danger" (click)="remove(c)">Delete</button>
          </div>
        </li>
      }
    </ul>
  `,
})
export class ContactListComponent {
  protected readonly categoryService = inject(CategoryService);
  private readonly contactService = inject(ContactService);

  protected readonly favoritesPage = inject(ActivatedRoute).snapshot.data['favoritesOnly'] === true;

  protected readonly search = signal('');
  protected readonly categoryFilter = signal('all');
  protected readonly favoritesOnly = signal(this.favoritesPage);
  protected readonly sort = signal<SortOption>('name-asc');

  private readonly categoryMap = computed(
    () => new Map(this.categoryService.categories().map((c) => [c.id, c])),
  );

  protected readonly contacts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const categoryId = this.categoryFilter();
    const onlyFavorites = this.favoritesOnly();

    const filtered = this.contactService.contacts().filter((c) => {
      if (onlyFavorites && !c.favorite) return false;
      if (categoryId !== 'all' && c.categoryId !== categoryId) return false;
      return term === '' || `${c.firstName} ${c.lastName}`.toLowerCase().includes(term);
    });

    return this.sortContacts(filtered, this.sort());
  });

  protected categoryOf(contact: Contact): Category | undefined {
    return contact.categoryId ? this.categoryMap().get(contact.categoryId) : undefined;
  }

  protected toggleFavorite(contact: Contact): void {
    this.contactService.toggleFavorite(contact.id);
  }

  protected remove(contact: Contact): void {
    if (window.confirm(`Delete ${contact.firstName} ${contact.lastName}?`)) {
      this.contactService.delete(contact.id);
    }
  }

  private sortContacts(list: Contact[], option: SortOption): Contact[] {
    const byName = (a: Contact, b: Contact): number =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    const sorted = [...list]; // never mutate the service's array
    switch (option) {
      case 'name-asc':
        return sorted.sort(byName);
      case 'name-desc':
        return sorted.sort((a, b) => byName(b, a));
      case 'date-desc':
        return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case 'date-asc':
        return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
  }
}
