import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RegistrationRequest } from '../../core/models/models';
import { RegistrationRequestService } from '../../core/services/registration-request.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-registration-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './registration-requests.component.html',
  styleUrl: './registration-requests.component.css'
})
export class RegistrationRequestsComponent implements OnInit {

  requests = signal<RegistrationRequest[]>([]);
  loading = signal(true);

  columns = ['no', 'name', 'email', 'requestedAt', 'actions'];

  constructor(
    private requestService: RegistrationRequestService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);

    this.requestService.getPending().subscribe({
      next: (res) => {
        this.requests.set(res);
        this.loading.set(false);
      },

      error: (err) => {
        this.loading.set(false);

        this.snackBar.open(
          err?.error?.message || 'Could not load registration requests',
          'Close',
          { duration: 4000 }
        );
      }
    });
  }

  approveRequest(request: RegistrationRequest): void {

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Approve Registration',
        message: `Approve "${request.name}"? This user will be added to the system.`
      }
    });

    ref.afterClosed().subscribe((confirmed) => {

      if (!confirmed) {
        return;
      }

      this.requestService.approve(request.id).subscribe({

        next: () => {

          // Remove approved request from the current list
          this.requests.update(requests =>
            requests.filter(r => r.id !== request.id)
          );

          this.snackBar.open(
            'Registration request approved successfully',
            'Close',
            { duration: 3000 }
          );
        },

        error: (err) => {

          this.snackBar.open(
            err?.error?.message ||
            'Could not approve registration request',
            'Close',
            { duration: 4000 }
          );
        }

      });
    });
  }

  rejectRequest(request: RegistrationRequest): void {

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reject Registration',
        message: `Reject "${request.name}"? This user will not be added to the system.`
      }
    });

    ref.afterClosed().subscribe((confirmed) => {

      if (!confirmed) {
        return;
      }

      this.requestService.reject(request.id).subscribe({

        next: () => {

          // Remove rejected request from the current list
          this.requests.update(requests =>
            requests.filter(r => r.id !== request.id)
          );

          this.snackBar.open(
            'Registration request rejected successfully',
            'Close',
            { duration: 3000 }
          );
        },

        error: (err) => {

          this.snackBar.open(
            err?.error?.message ||
            'Could not reject registration request',
            'Close',
            { duration: 4000 }
          );
        }

      });
    });
  }
}