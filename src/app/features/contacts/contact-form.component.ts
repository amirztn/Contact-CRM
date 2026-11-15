import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes.guard';
import { ContactInput } from '../../core/models/contact.model';
import { CategoryService } from '../../core/services/category.service';
import { ContactService } from '../../core/services/contact.service';
import { getErrorMessage } from '../../shared/validators/error.msg';
import { emailValidator, notBlank, phoneValidator } from '../../shared/validators/form.validators';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>{{ isEdit ? 'Edit contact' : 'New contact' }}</h1>

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      @if (submitError(); as message) {
        <p class="alert alert-error" role="alert">{{ message }}</p>
      }

      <div class="row">
        <div class="field">
          <label for="firstName">First name *</label>
          <input id="firstName" formControlName="firstName" autocomplete="given-name" />
          @if (message(form.controls.firstName); as msg) {
            <p class="error" role="alert">{{ msg }}</p>
          }
        </div>
        <div class="field">
          <label for="lastName">Last name *</label>
          <input id="lastName" formControlName="lastName" autocomplete="family-name" />
          @if (message(form.controls.lastName); as msg) {
            <p class="error" role="alert">{{ msg }}</p>
          }
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label for="email">Email *</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" />
          @if (message(form.controls.email); as msg) {
            <p class="error" role="alert">{{ msg }}</p>
          }
        </div>
        <div class="field">
          <label for="phone">Phone *</label>
          <input id="phone" type="tel" formControlName="phone" autocomplete="tel" />
          @if (message(form.controls.phone); as msg) {
            <p class="error" role="alert">{{ msg }}</p>
          }
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label for="company">Company</label>
          <input id="company" formControlName="company" />
          @if (message(form.controls.company); as msg) {
            <p class="error" role="alert">{{ msg }}</p>
          }
        </div>
        <div class="field">
          <label for="jobTitle">Job title</label>
          <input id="jobTitle" formControlName="jobTitle" />
          @if (message(form.controls.jobTitle); as msg) {
            <p class="error" role="alert">{{ msg }}</p>
          }
        </div>
      </div>

      <div class="field">
        <label for="categoryId">Category</label>
        <select id="categoryId" formControlName="categoryId">
          <option [ngValue]="null">No category</option>
          @for (c of categoryService.categories(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
      </div>

      <div class="field">
        <label for="notes">Notes</label>
        <textarea id="notes" rows="4" formControlName="notes"></textarea>
        @if (message(form.controls.notes); as msg) {
          <p class="error" role="alert">{{ msg }}</p>
        }
      </div>

      <label class="checkbox">
        <input type="checkbox" formControlName="favorite" /> Mark as favorite
      </label>

      <div class="actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <a class="btn" routerLink="/contacts">Cancel</a>
      </div>
    </form>
  `,
})
export class ContactFormComponent implements HasUnsavedChanges {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contactService = inject(ContactService);
  protected readonly categoryService = inject(CategoryService);

  private readonly editId = this.route.snapshot.paramMap.get('id');
  private submitted = false;

  protected readonly isEdit = this.editId !== null;
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    firstName: ['', [Validators.required, notBlank, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, notBlank, Validators.maxLength(50)]],
    email: ['', [Validators.required, emailValidator]],
    phone: ['', [Validators.required, phoneValidator]],
    company: ['', [Validators.maxLength(80)]],
    jobTitle: ['', [Validators.maxLength(80)]],
    categoryId: this.fb.control<string | null>(null),
    favorite: [false],
    notes: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    if (this.editId) {
      const contact = this.contactService.getById(this.editId);
      if (!contact) {
        void this.router.navigate(['/contacts']);
        return;
      }
      this.form.patchValue(contact); // prefill (unknown keys like id are ignored)
    }
  }

  hasUnsavedChanges(): boolean {
    return !this.submitted && this.form.dirty;
  }

  protected message(control: AbstractControl): string | null {
    return getErrorMessage(control);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // reveal all errors at once
      return;
    }
    const raw = this.form.getRawValue();
    const input: ContactInput = {
      ...raw,
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      email: raw.email.trim().toLowerCase(),
      phone: raw.phone.trim(),
      company: raw.company.trim(),
      jobTitle: raw.jobTitle.trim(),
      notes: raw.notes.trim(),
    };

    try {
      const contact = this.editId
        ? this.contactService.update(this.editId, input)
        : this.contactService.create(input);
      this.submitted = true; // disables the unsaved-changes guard
      void this.router.navigate(['/contacts', contact.id]);
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Unexpected error.');
    }
  }
}
