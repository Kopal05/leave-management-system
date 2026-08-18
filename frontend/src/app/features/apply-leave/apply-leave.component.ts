import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveRequest } from '../../core/models/models';

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './apply-leave.component.html',
  styleUrl: './apply-leave.component.css'
})
export class ApplyLeaveComponent {

  submitting = signal(false);
  minDate = new Date();

  form: ReturnType<FormBuilder['group']>;

constructor(
  private fb: FormBuilder,
  private leaveService: LeaveService,
  private snackBar: MatSnackBar,
  private router: Router
) {
  this.form = this.fb.group({
    title: ['', Validators.required],
    reason: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required]
  });
}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, reason, startDate, endDate } = this.form.getRawValue();

    if (startDate && endDate && endDate < startDate) {
      this.snackBar.open('End date must be on or after the start date', 'Close', { duration: 4000 });
      return;
    }

    const request: LeaveRequest = {
      title: title!,
      reason: reason!,
      startDate: formatDate(startDate!),
      endDate: formatDate(endDate!)
    };

    this.submitting.set(true);
    this.leaveService.applyLeave(request).subscribe({
      next: res => {
        this.submitting.set(false);
        const message = res.data.overlapWarning
          ? `Leave applied. Note: ${res.data.overlapWarning}`
          : 'Leave applied successfully';
        this.snackBar.open(message, 'Close', { duration: 5000 });
        this.router.navigate(['/my-leaves']);
      },
      error: err => {
        this.submitting.set(false);
        this.snackBar.open(err?.error?.message || 'Could not apply leave', 'Close', { duration: 4000 });
      }
    });
  }
}
