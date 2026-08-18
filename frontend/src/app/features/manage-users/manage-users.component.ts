import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { AppUser, UserRequest } from '../../core/models/models';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent implements OnInit {

  users = signal<AppUser[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingUser = signal<AppUser | null>(null);

  columns = ['name', 'email', 'role', 'createdAt', 'actions'];

  form: ReturnType<FormBuilder['group']>;

constructor(
  private fb: FormBuilder,
  private userService: UserService,
  private dialog: MatDialog,
  private snackBar: MatSnackBar
) {
  this.form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['USER', Validators.required]
  });
}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: res => { this.users.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreateForm(): void {
    this.editingUser.set(null);
    this.form.reset({ role: 'USER' });
    this.form.get('password')?.setValidators([Validators.required]);
    this.form.get('password')?.updateValueAndValidity();
    this.showForm.set(true);
  }

  openEditForm(user: AppUser): void {
    this.editingUser.set(user);
    this.form.reset({ name: user.name, email: user.email, password: '', role: user.role });
    // Password optional on edit - leave blank to keep existing
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingUser.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue() as UserRequest;
    const editing = this.editingUser();

    const obs = editing
      ? this.userService.update(editing.id, request)
      : this.userService.create(request);

    obs.subscribe({
      next: res => {
        this.snackBar.open(res.message, 'Close', { duration: 3000 });
        this.showForm.set(false);
        this.loadUsers();
      },
      error: err => this.snackBar.open(err?.error?.message || 'Something went wrong', 'Close', { duration: 4000 })
    });
  }

  deleteUser(user: AppUser): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete User', message: `Delete "${user.name}"? This cannot be undone.` }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.userService.delete(user.id).subscribe({
        next: res => {
          this.snackBar.open(res.message, 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: err => this.snackBar.open(err?.error?.message || 'Could not delete user', 'Close', { duration: 4000 })
      });
    });
  }
}
