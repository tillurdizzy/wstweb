import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { createClient, SupabaseClient, AuthError, PostgrestError } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService implements OnDestroy {
  client: SupabaseClient;
  private userSignal = signal<any>(null);
  user = computed(() => this.userSignal());
  private authStateSubscription: Subscription | null = null;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Initialize user state lazily with enhanced error handling
    this.client.auth.getUser().catch((err: any) => {
      if (err && typeof err === 'object' && 'message' in err && 
          (err.message.includes('LockManager') || err.message.includes('storage'))) {
        console.warn('Suppressed LockManager/storage error on getUser:', err.message);
      } else {
        console.warn('Initial getUser failed:', err?.message || err);
      }
      this.userSignal.set(null);
    });

    // Handle auth state changes with proper subscription
    this.authStateSubscription = (this.client.auth.onAuthStateChange((event, session) => {
      try {
        if (session) {
          this.userSignal.set(session.user);
        }
      } catch (err: any) {
        if (err && typeof err === 'object' && 'message' in err && 
            (err.message.includes('LockManager') || err.message.includes('storage'))) {
          console.warn('Suppressed LockManager/storage error on auth state change:', err.message);
        } else {
          console.warn('Auth state change error:', err?.message || err);
        }
      }
    }).data.subscription) as unknown as Subscription; // Safe type conversion via unknown
  }

  ngOnDestroy() {
    // Cleanup subscription on service destruction
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  async getUser() {
    try {
      const { data, error } = await this.client.auth.getUser();
      if (error) {
        console.error('Error getting user:', (error as AuthError).message);
        throw error;
      }
      this.userSignal.set(data?.user || null);
      return { data, error } as { data: any; error: AuthError | null };
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        console.warn('Caught error in getUser:', err.message);
      } else {
        console.warn('Caught error in getUser:', err);
      }
      throw err;
    }
  }

  async signInWithPassword(credentials: { email: string; password: string }) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword(credentials);
      if (error) {
        console.error('Error signing in:', (error as AuthError).message);
        throw error;
      }
      return { data, error } as { data: any; error: AuthError | null };
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        console.warn('Caught error in signInWithPassword:', err.message);
      } else {
        console.warn('Caught error in signInWithPassword:', err);
      }
      throw err;
    }
  }

  async resetPasswordForEmail(email: string) {
    const redirectTo = `${window.location.origin}/password-reset`;
    console.log('Redirect URL for reset:', redirectTo);
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) {
        console.error('Error resetting password:', (error as AuthError).message);
        throw error;
      }
      return { error } as { error: AuthError | null };
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        console.warn('Caught error in resetPasswordForEmail:', err.message);
      } else {
        console.warn('Caught error in resetPasswordForEmail:', err);
      }
      throw err;
    }
  }

  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) {
        console.error('Error signing out:', (error as AuthError).message);
        throw error;
      }
      this.userSignal.set(null);
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        console.warn('Caught error in signOut:', err.message);
      } else {
        console.warn('Caught error in signOut:', err);
      }
      throw err;
    }
  }

  async isAdmin(): Promise<boolean> {
    const { data: user } = await this.getUser();
    if (!user?.user) return false;
    const { data, error } = await this.client
      .from('owners')
      .select('is_admin')
      .eq('uuid', user.user.id)
      .single();
    if (error) {
      console.error('Error checking admin status:', (error as PostgrestError).message);
      return false;
    }
    return data?.is_admin || false;
  }

  async uploadFile(bucket: string, fileName: string, file: File) {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });
      if (error) throw error;
      return { data: this.client.storage.from(bucket).getPublicUrl(fileName).data.publicUrl, error: null } as { data: string; error: PostgrestError | null };
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        console.warn('Caught error in uploadFile:', err.message);
      } else {
        console.warn('Caught error in uploadFile:', err);
      }
      throw err;
    }
  }

  async updatePdfPath(table: string, fileName: string) {
    try {
      const { error } = await this.client
        .from(table)
        .upsert({ pdf_path: fileName }, { onConflict: 'pdf_path' });
      if (error) throw error;
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        console.warn('Caught error in updatePdfPath:', err.message);
      } else {
        console.warn('Caught error in updatePdfPath:', err);
      }
      throw err;
    }
  }

  async updateUser(updates: { password: string }) {
    try {
      console.log('Calling updateUser with updates:', updates);
      const { data, error } = await this.client.auth.updateUser(updates);
      console.log('Update User Response:', { data, error });
      if (error) {
        console.error('Error updating user:', (error as AuthError).message);
        throw error;
      }
      return { data, error } as { data: any; error: AuthError | null };
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        console.warn('Caught error in updateUser:', err.message);
      } else {
        console.warn('Caught error in updateUser:', err);
      }
      throw err;
    }
  }
}