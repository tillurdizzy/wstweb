import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,         // For mat-card
    MatFormFieldModule,    // For mat-form-field
    MatInputModule,        // For matInput
    MatButtonModule,       // For mat-raised-button
    MatIconModule,         // For mat-icon
    MatSnackBarModule,     // For snackbar
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true; // For password visibility toggle

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    try {
      const { data, error } = await this.supabaseService.signInWithPassword({ email, password });
      this.loading = false;
      if (error) {
        this.snackBar.open(`Error: ${error.message ?? 'An unknown error occurred'}`, 'Close', { duration: 3000 });
      } else if (data.user) {
        this.snackBar.open('Login successful!', 'Close', { duration: 2000 });
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.loading = false;
      this.snackBar.open(`Error: ${(error as Error).message ?? 'An unknown error occurred'}`, 'Close', { duration: 3000 });
    }
  }

  async resetPassword() {
    const email = this.loginForm.get('email')?.value;
    if (!email || this.loginForm.get('email')?.hasError('email')) {
      this.snackBar.open('Please enter a valid email first', 'Close', { duration: 3000 });
      return;
    }

    try {
      const { error } = await this.supabaseService.resetPasswordForEmail(email);
      if (error) {
        this.snackBar.open(`Error: ${error.message ?? 'An unknown error occurred'}`, 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Check your email for a password reset link!', 'Close', { duration: 5000 });
      }
    } catch (error) {
      this.snackBar.open(`Error: ${(error as Error).message ?? 'An unknown error occurred'}`, 'Close', { duration: 3000 });
    }
  }
}