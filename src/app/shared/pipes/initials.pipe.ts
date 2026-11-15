import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from '../../core/models/contact.model';

@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
    return `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase();
  }
}
