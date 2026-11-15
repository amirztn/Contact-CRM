import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes.guard';
import { CategoryService } from '../../core/services/category.service';
import { getErrorMessage } from '../../shared/validators/error.msg';
import { notBlank } from '../../shared/validators/form.validators';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>{{ isEdit ? 'Edit category' : 'New category' }}</h1>

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      @if (submitError(); as message) {
        <p class="alert alert-error" role="alert">{{ message }}</p>
      }

      <div class="field">
        <label for="name">Name *</label>
        <input id="name" formControlName="name" autocomplete="off" />
        @if (message(form.controls.name); as msg) {
          <p class="error" role="alert">{{ msg }}</p>
        }
      </div>

      <div class="field">
        <label for="color">Color *</label>
        <input id="color" type="color" formControlName="color" />
        @if (message(form.controls.color); as msg) {
          <p class="error" role="alert">{{ msg }}</p>
        }
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <a class="btn" routerLink="/categories">Cancel</a>
      </div>
    </form>
  `,
})
export class CategoryFormComponent implements HasUnsavedChanges {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);

  private readonly editId = this.route.snapshot.paramMap.get('id');
  private submitted = false;

  protected readonly isEdit = this.editId !== null;
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, notBlank, Validators.maxLength(40)]],
    color: ['#3b82f6', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
  });

  constructor() {
    if (this.editId) {
      const category = this.categoryService.getById(this.editId);
      if (!category) {
        void this.router.navigate(['/categories']);
        return;
      }
      this.form.patchValue(category);
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
      this.form.markAllAsTouched();
      return;
    }
    const { name, color } = this.form.getRawValue();
    try {
      if (this.editId) {
        this.categoryService.update(this.editId, name, color);
      } else {
        this.categoryService.create(name, color);
      }
      this.submitted = true;
      void this.router.navigate(['/categories']);
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Unexpected error.');
    }
  }
}
