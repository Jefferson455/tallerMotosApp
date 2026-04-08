import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Login } from './components/pages/login/login';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];
