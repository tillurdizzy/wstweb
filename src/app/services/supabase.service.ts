import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl,environment.supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  // Auth methods
  async signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`,
    });
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw error;
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
      console.error('Error checking admin status:', error.message);
      return false;
    }
    return data?.is_admin ?? false;
  }
}