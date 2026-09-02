import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password, confirmPassword } =
      this.form.getRawValue();

    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.register({
      name: name!,
      email: email!,
      password: password!
    }).subscribe({
      next: (res) => {
        this.loading.set(false);

        this.successMessage.set(
          res.message ||
          'Registration request submitted successfully. Please wait for admin approval.'
        );
      },

      error: (err) => {
        this.loading.set(false);

        this.errorMessage.set(
          err?.error?.message ||
          'Unable to submit registration request'
        );
      }
    });
  }

  backToRegistration(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.form.reset();

    this.form.markAsPristine();
    this.form.markAsUntouched();

    this.hidePassword.set(true);
    this.hideConfirmPassword.set(true);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}