import { Injectable, inject, signal } from '@angular/core';
import { Category } from '../models/category.model';
import { ContactService } from './contact.service';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'crm.categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly storage = inject(StorageService);
  private readonly contactService = inject(ContactService);
  private readonly state = signal<Category[]>(this.storage.read<Category[]>(STORAGE_KEY, []));

  readonly categories = this.state.asReadonly();

  getById(id: string): Category | undefined {
    return this.state().find((c) => c.id === id);
  }

  create(name: string, color: string): Category {
    this.assertUniqueName(name);
    const category: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      createdAt: new Date().toISOString(),
    };
    this.commit([...this.state(), category]);
    return category;
  }

  update(id: string, name: string, color: string): Category {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }
    this.assertUniqueName(name, id);
    const updated: Category = { ...existing, name: name.trim(), color };
    this.commit(this.state().map((c) => (c.id === id ? updated : c)));
    return updated;
  }

  /** A category that still contains contacts cannot be deleted. */
  delete(id: string): void {
    const count = this.contactService.countInCategory(id);
    if (count > 0) {
      throw new Error(
        `This category still contains ${count} contact(s). Move or delete them before deleting the category.`,
      );
    }
    this.commit(this.state().filter((c) => c.id !== id));
  }

  private assertUniqueName(name: string, ignoreId?: string): void {
    const normalized = name.trim().toLowerCase();
    const duplicate = this.state().some(
      (c) => c.id !== ignoreId && c.name.toLowerCase() === normalized,
    );
    if (duplicate) {
      throw new Error('A category with this name already exists.');
    }
  }

  private commit(categories: Category[]): void {
    this.storage.write(STORAGE_KEY, categories);
    this.state.set(categories);
  }
}
