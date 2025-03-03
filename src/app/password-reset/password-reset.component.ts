import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    ToastModule,
    FloatLabelModule,
    FluidModule,
  ],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  providers: [MessageService],
})
export class PasswordResetComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Extract token from URL query params
    this.route.queryParams.subscribe(params => {
      this.token = params['access_token'] || null; // Adjust based on Supabase's actual param name
      if (!this.token) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid or missing reset token. Please request a new reset link.' });
        setTimeout(() => this.router.navigate(['/login']), 3000); // Redirect after 3s
      }
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  async onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.loading = true;
    const { password } = this.resetForm.value;

    try {
      // Update the user's password using Supabase
      const { data, error } = await this.supabaseService.updateUser({ password });
      this.loading = false;

      if (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message ?? 'An unknown error occurred' });
      } else if (data.user) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password updated successfully! Redirecting to login...' });
        setTimeout(() => this.router.navigate(['/login']), 2000); // Redirect after 2s
      }
    } catch (error) {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: (error as Error).message ?? 'An unknown error occurred' });
    }
  }
}
