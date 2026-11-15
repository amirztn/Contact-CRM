import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  /** Reads and parses a JSON value; returns the fallback if missing or corrupted. */
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  /** Serializes and stores a value; throws a readable error on failure (e.g. quota exceeded). */
  write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      throw new Error('Unable to save data in the browser storage.');
    }
  }
}
