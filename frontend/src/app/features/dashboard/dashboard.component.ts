import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { LeaveService } from '../../core/services/leave.service';
import { DashboardResponse } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatTableModule, MatChipsModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  loading = signal(true);
  dashboard = signal<DashboardResponse | null>(null);

  upcomingColumns = ['userName', 'title', 'startDate', 'endDate', 'status'];
  employeeColumns = ['name', 'email', 'role'];

  constructor(public auth: AuthService, private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.leaveService.getDashboard().subscribe({
      next: res => {
        this.dashboard.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
