import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'contacts',
    title: 'Contacts',
    loadComponent: () =>
      import('./features/contacts/contact-list.component').then((m) => m.ContactListComponent),
  },
  {
    path: 'contacts/new', // must stay before "contacts/:id"
    title: 'New contact',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./features/contacts/contact-form.component').then((m) => m.ContactFormComponent),
  },
  {
    path: 'contacts/:id',
    title: 'Contact details',
    loadComponent: () =>
      import('./features/contacts/contact-detail.component').then((m) => m.ContactDetailComponent),
  },
  {
    path: 'contacts/:id/edit',
    title: 'Edit contact',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./features/contacts/contact-form.component').then((m) => m.ContactFormComponent),
  },
  {
    path: 'categories',
    title: 'Categories',
    loadComponent: () =>
      import('./features/categories/category-list.component').then((m) => m.CategoryListComponent),
  },
  {
    path: 'categories/new',
    title: 'New category',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./features/categories/category-form.component').then((m) => m.CategoryFormComponent),
  },
  {
    path: 'categories/:id',
    title: 'Category',
    loadComponent: () =>
      import('./features/categories/category-detail.component').then(
        (m) => m.CategoryDetailComponent,
      ),
  },
  {
    path: 'categories/:id/edit',
    title: 'Edit category',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./features/categories/category-form.component').then((m) => m.CategoryFormComponent),
  },
  {
    path: 'favorites',
    title: 'Favorites',
    data: { favoritesOnly: true }, // same list component, pre-filtered
    loadComponent: () =>
      import('./features/contacts/contact-list.component').then((m) => m.ContactListComponent),
  },
  { path: '**', redirectTo: '' },
];
