import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';

const TEMP_PASSWORD = '123456';

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
export class PasswordResetComponent implements OnInit, OnDestroy {
  resetForm: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;
  loading = false;
  token: string | null = null;
  refreshToken: string | null = null;
  sessionReady = false;
  private fragmentSub: Subscription | null = null;
  private routerEventsSub: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.resetForm = this.fb.group(
      {
        password: this.fb.control<string>('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: this.fb.control<string>('', [Validators.required]),
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>) {
    const password = form.controls.password.value;
    const confirmPassword = form.controls.confirmPassword.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  async ngOnInit() {
    const forced = this.route.snapshot.queryParamMap.get('force') === '1';
    if (forced) {
      const { data } = await this.supabaseService.client.auth.getSession();
      if (data.session) {
        this.sessionReady = true;
        return;
      }
    }

    this.fragmentSub = this.route.fragment.subscribe({
      next: (fragment) => {
        const fullFragment = fragment || window.location.hash.substring(1);
        if (fullFragment) {
          const params = new URLSearchParams(fullFragment);
          this.token = params.get('access_token');
          this.refreshToken = params.get('refresh_token');
          if (!this.token) {
            this.handleInvalidToken();
          } else {
            this.sessionReady = true;
          }
        } else if (!forced) {
          this.handleInvalidToken();
        }
      },
      error: () => this.handleInvalidToken(),
    });
  }

  private handleInvalidToken() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Invalid or missing reset token. Please request a new reset link.',
    });
    setTimeout(() => this.router.navigate(['login']), 3000);
  }

  ngOnDestroy() {
    if (this.fragmentSub) this.fragmentSub.unsubscribe();
    if (this.routerEventsSub) this.routerEventsSub.unsubscribe();
  }

  async onSubmit() {
    if (this.resetForm.invalid || (!this.token && !this.sessionReady)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Form',
        detail: 'Please ensure all fields are filled correctly.',
      });
      return;
    }

    const password = this.resetForm.value.password!;
    if (password === TEMP_PASSWORD) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Choose a different password',
        detail: 'Do not reuse the temporary password.',
      });
      return;
    }

    this.loading = true;
    try {
      if (this.token) {
        const { error: authError } = await this.supabaseService.client.auth.setSession({
          access_token: this.token,
          refresh_token: this.refreshToken || '',
        });
        if (authError) throw new Error(authError.message || 'Failed to authenticate with token');
      }

      const { data, error } = await this.supabaseService.updateUser({ password });
      this.loading = false;
      if (error) throw new Error(error.message || 'Failed to update password');

      if (data.user) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password updated successfully! Redirecting…',
        });
        setTimeout(() => this.router.navigate(['/home']), 1500);
      }
    } catch (error) {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }
}