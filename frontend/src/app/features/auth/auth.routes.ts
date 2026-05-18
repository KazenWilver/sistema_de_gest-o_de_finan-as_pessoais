import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot',
    loadComponent: () => import('./forgot.component').then((m) => m.ForgotComponent),
  },
  {
    path: 'reset',
    loadComponent: () => import('./reset.component').then((m) => m.ResetComponent),
  },
];
