import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from '../../core/models/contact.model';

@Pipe({ name: 'fullName' })
export class FullNamePipe implements PipeTransform {
  transform(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
    return `${contact.firstName} ${contact.lastName}`.trim();
  }
}
