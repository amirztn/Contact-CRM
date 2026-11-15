import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ContactService } from '../../core/services/contact.service';
import { FullNamePipe } from '../../shared/pipes/full-name.pipe';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-contact-detail',
  imports: [RouterLink, DatePipe, FullNamePipe, InitialsPipe],
  template: `
    @if (contact(); as c) {
      <div class="page-header">
        <h1>
          <span class="avatar" aria-hidden="true">{{ c | initials }}</span>
          {{ c | fullName }}
        </h1>
        <a class="btn" routerLink="/contacts">← Back to contacts</a>
      </div>

      <dl class="details">
        <dt>Email</dt>
        <dd>
          <a [href]="'mailto:' + c.email">{{ c.email }}</a>
        </dd>
        <dt>Phone</dt>
        <dd>{{ c.phone }}</dd>
        <dt>Company</dt>
        <dd>{{ c.company || '—' }}</dd>
        <dt>Job title</dt>
        <dd>{{ c.jobTitle || '—' }}</dd>
        <dt>Category</dt>
        <dd>
          @if (category(); as cat) {
            <span class="badge" [style.background-color]="cat.color">{{ cat.name }}</span>
          } @else {
            —
          }
        </dd>
        <dt>Notes</dt>
        <dd class="notes">{{ c.notes || '—' }}</dd>
        <dt>Created</dt>
        <dd>{{ c.createdAt | date: 'medium' }}</dd>
        <dt>Updated</dt>
        <dd>{{ c.updatedAt | date: 'medium' }}</dd>
      </dl>

      <div class="actions">
        <button
          type="button"
          class="btn"
          [attr.aria-pressed]="c.favorite"
          (click)="toggleFavorite(c.id)"
        >
          {{ c.favorite ? '★ Remove from favorites' : '☆ Add to favorites' }}
        </button>
        <a class="btn" [routerLink]="['/contacts', c.id, 'edit']">Edit</a>
        <button
          type="button"
          class="btn btn-danger"
          (click)="remove(c.id, c.firstName, c.lastName)"
        >
          Delete
        </button>
      </div>
    } @else {
      <p class="alert alert-error" role="alert">Contact not found.</p>
      <a class="btn" routerLink="/contacts">← Back to contacts</a>
    }
  `,
})
export class ContactDetailComponent {
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly router = inject(Router);
  private readonly contactService = inject(ContactService);
  private readonly categoryService = inject(CategoryService);

  protected readonly contact = computed(() => this.contactService.getById(this.id));
  protected readonly category = computed(() => {
    const categoryId = this.contact()?.categoryId;
    return categoryId ? this.categoryService.getById(categoryId) : undefined;
  });

  protected toggleFavorite(id: string): void {
    this.contactService.toggleFavorite(id);
  }

  protected remove(id: string, firstName: string, lastName: string): void {
    if (window.confirm(`Delete ${firstName} ${lastName}?`)) {
      this.contactService.delete(id);
      void this.router.navigate(['/contacts']);
    }
  }
}
