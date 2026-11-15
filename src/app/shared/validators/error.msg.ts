import { AbstractControl } from '@angular/forms';

/** Returns a user-friendly message for the first error of a control, once it was touched. */
export function getErrorMessage(control: AbstractControl): string | null {
  const errors = control.errors;
  if (!errors || !(control.touched || control.dirty)) return null;

  if (errors['required']) return 'This field is required.';
  if (errors['notBlank']) return 'This field cannot be only spaces.';
  if (errors['email']) return 'Enter a valid email address (e.g. name@example.com).';
  if (errors['phone']) return 'Enter a valid phone number (8 to 15 digits).';
  if (errors['pattern']) return 'Invalid format.';
  if (errors['maxlength']) {
    const max = (errors['maxlength'] as { requiredLength: number }).requiredLength;
    return `Maximum ${max} characters.`;
  }
  return 'Invalid value.';
}
