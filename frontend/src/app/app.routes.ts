import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'manage-users',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/manage-users/manage-users.component').then(m => m.ManageUsersComponent)
  },
  {
    path: 'apply-leave',
    canActivate: [authGuard],
    loadComponent: () => import('./features/apply-leave/apply-leave.component').then(m => m.ApplyLeaveComponent)
  },
  {
    path: 'my-leaves',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-leaves/my-leaves.component').then(m => m.MyLeavesComponent)
  },
  {
    path: 'team-calendar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/team-calendar/team-calendar.component').then(m => m.TeamCalendarComponent)
  },

  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
