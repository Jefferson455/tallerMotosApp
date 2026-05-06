import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Login } from './components/pages/login/login';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { DashboardCustomers } from './components/pages/dashboard-customers/dashboard-customers';
import { DashboardLayout } from './components/pages/dashboard-layout/dashboard-layout';
import { DashboardBikes } from './components/pages/dashboard-bikes/dashboard-bikes';
import { DashboardServices } from './components/pages/dashboard-services/dashboard-services';
import { DashboardReminders } from './components/pages/dashboard-reminders/dashboard-reminders';

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
      {
        path: 'bikes',
        component: DashboardBikes,
      },
      {
        path: 'services',
        component: DashboardServices,
      },
      {
        path: 'reminders',
        component: DashboardReminders,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];
