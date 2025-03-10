import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
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
  resetForm: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;
  loading = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.router.events.subscribe(event => console.log('Router Event:', event));

    // Typed FormGroup
    this.resetForm = this.fb.group(
      {
        password: this.fb.control<string>('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: this.fb.control<string>('', [Validators.required]),
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Update the validator to work with typed form
  passwordMatchValidator(form: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>) {
    const password = form.controls.password.value;
    const confirmPassword = form.controls.confirmPassword.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['access_token'] || null;
      console.log('Token:', this.token); // Debug
      if (!this.token) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid or missing reset token. Please request a new reset link.' });
        setTimeout(() => this.router.navigate(['/login']), 3000);
      }
    });
  }

  async onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.loading = true;
    const { password } = this.resetForm.value;

    try {
      const { data, error } = await this.supabaseService.updateUser({ password: password! }); // Non-null assertion since form is validated
      console.log('Update User Response:', { data, error }); // Debug
      this.loading = false;

      if (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message ?? 'An unknown error occurred' });
      } else if (data.user) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password updated successfully! Redirecting to login...' });
        setTimeout(() => this.router.navigate(['/login']), 2000);
      }
    } catch (error) {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: (error as Error).message ?? 'An unknown error occurred' });
    }
  }
}