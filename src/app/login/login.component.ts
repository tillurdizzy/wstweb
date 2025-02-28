import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast'; // For snackbar-like feedback
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService], // Provide MessageService for toast
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private messageService: MessageService
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
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message ?? 'An unknown error occurred' });
      } else if (data.user) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Login successful!' });
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: (error as Error).message ?? 'An unknown error occurred' });
    }
  }

  async resetPassword() {
    const email = this.loginForm.get('email')?.value;
    if (!email || this.loginForm.get('email')?.hasError('email')) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter a valid email first' });
      return;
    }

    try {
      const { error } = await this.supabaseService.resetPasswordForEmail(email);
      if (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message ?? 'An unknown error occurred' });
      } else {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Check your email for a password reset link!' });
      }
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: (error as Error).message ?? 'An unknown error occurred' });
    }
  }
}