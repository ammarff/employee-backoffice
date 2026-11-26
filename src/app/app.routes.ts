import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(module => module.Login),
  },
  {
    path: 'employees',
    loadComponent: () => import('./employees/employee-list/employee-list').then(module => module.EmployeeList),
    canActivate: [authGuard],
  },
  {
    path: 'employees/add',
    loadComponent: () => import('./employees/employee-add/employee-add').then(module => module.EmployeeAdd),
    canActivate: [authGuard],
  },
  {
    path: 'employees/:id',
    loadComponent: () => import('./employees/employee-detail/employee-detail').then(module => module.EmployeeDetail),
    canActivate: [authGuard],
  },
];
