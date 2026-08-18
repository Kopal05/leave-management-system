import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../core/services/leave.service';
import { Leave, LeaveRequest } from '../../core/models/models';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatTooltipModule, MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './my-leaves.component.html',
  styleUrl: './my-leaves.component.css'
})
export class MyLeavesComponent implements OnInit {

  leaves = signal<Leave[]>([]);
  loading = signal(true);
  editingLeaveId = signal<number | null>(null);
  minDate = new Date();

  columns = ['title', 'startDate', 'endDate', 'status', 'actions'];

  form: ReturnType<FormBuilder['group']>;

constructor(
  private fb: FormBuilder,
  private leaveService: LeaveService,
  private dialog: MatDialog,
  private snackBar: MatSnackBar
) {
  this.form = this.fb.group({
    title: ['', Validators.required],
    reason: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required]
  });
}

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves(): void {
    this.loading.set(true);
    this.leaveService.getMyLeaves().subscribe({
      next: res => { this.leaves.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  startEdit(leave: Leave): void {
    this.editingLeaveId.set(leave.id);
    this.form.reset({
      title: leave.title,
      reason: leave.reason,
      startDate: new Date(leave.startDate),
      endDate: new Date(leave.endDate)
    });
  }

  cancelEdit(): void {
    this.editingLeaveId.set(null);
  }

  saveEdit(leaveId: number): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, reason, startDate, endDate } = this.form.getRawValue();
    const request: LeaveRequest = {
      title: title!,
      reason: reason!,
      startDate: formatDate(startDate!),
      endDate: formatDate(endDate!)
    };

    this.leaveService.updateLeave(leaveId, request).subscribe({
      next: res => {
        this.snackBar.open(res.message, 'Close', { duration: 3000 });
        this.editingLeaveId.set(null);
        this.loadLeaves();
      },
      error: err => this.snackBar.open(err?.error?.message || 'Could not update leave', 'Close', { duration: 4000 })
    });
  }

  cancelLeave(leave: Leave): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Cancel Leave', message: `Cancel your leave "${leave.title}"?` }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.leaveService.cancelLeave(leave.id).subscribe({
        next: res => {
          this.snackBar.open(res.message, 'Close', { duration: 3000 });
          this.loadLeaves();
        },
        error: err => this.snackBar.open(err?.error?.message || 'Could not cancel leave', 'Close', { duration: 4000 })
      });
    });
  }
}
