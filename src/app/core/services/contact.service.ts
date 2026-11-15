import { Injectable, computed, inject, signal } from '@angular/core';
import { Contact, ContactInput } from '../models/contact.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'crm.contacts';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly storage = inject(StorageService);
  private readonly state = signal<Contact[]>(this.storage.read<Contact[]>(STORAGE_KEY, []));

  readonly contacts = this.state.asReadonly();
  readonly favorites = computed(() => this.state().filter((c) => c.favorite));

  getById(id: string): Contact | undefined {
    return this.state().find((c) => c.id === id);
  }

  countInCategory(categoryId: string): number {
    return this.state().filter((c) => c.categoryId === categoryId).length;
  }

  create(input: ContactInput): Contact {
    const now = new Date().toISOString();
    const contact: Contact = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.commit([...this.state(), contact]);
    return contact;
  }

  update(id: string, input: ContactInput): Contact {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error('Contact not found.');
    }
    const updated: Contact = { ...existing, ...input, updatedAt: new Date().toISOString() };
    this.commit(this.state().map((c) => (c.id === id ? updated : c)));
    return updated;
  }

  toggleFavorite(id: string): void {
    this.commit(
      this.state().map((c) =>
        c.id === id ? { ...c, favorite: !c.favorite, updatedAt: new Date().toISOString() } : c,
      ),
    );
  }

  delete(id: string): void {
    this.commit(this.state().filter((c) => c.id !== id));
  }

  /** Saves first, then updates the signal: the UI never shows data that failed to persist. */
  private commit(contacts: Contact[]): void {
    this.storage.write(STORAGE_KEY, contacts);
    this.state.set(contacts);
  }
}
