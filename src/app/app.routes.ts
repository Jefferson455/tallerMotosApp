import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Login } from './components/pages/login/login';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { DashboardCustomers } from './components/pages/dashboard-customers/dashboard-customers';
import { DashboardLayout } from './components/pages/dashboard-layout/dashboard-layout';

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
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Dashboard,
      },
      {
        path: 'customers',
        component: DashboardCustomers,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];
