import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Rejects values made only of whitespace (empty values are left to Validators.required). */
export const notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as string;
  return value.length > 0 && value.trim() === '' ? { notBlank: true } : null;
};

/** Stricter than Validators.email: requires a domain with a TLD ("a@b" is rejected). */
export const emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = (control.value as string).trim();
  if (value === '') return null;
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value) ? null : { email: true };
};

/** Accepts digits, spaces, dots, dashes, parentheses and a leading "+"; 8 to 15 digits. */
export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = (control.value as string).trim();
  if (value === '') return null;
  const validChars = /^\+?[\d\s().-]+$/.test(value);
  const digits = value.replace(/\D/g, '').length;
  return validChars && digits >= 8 && digits <= 15 ? null : { phone: true };
};
