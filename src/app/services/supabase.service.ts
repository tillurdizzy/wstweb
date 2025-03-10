import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, AuthError, PostgrestError } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  client: SupabaseClient;
  private userSignal = signal<any>(null);
  user = computed(() => this.userSignal());

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
    // Initialize user state lazily
    this.client.auth.getUser().catch(err => {
      console.warn('Initial getUser failed (possibly Zr error):', err);
      this.userSignal.set(null); // Set to null if there's an error
    });
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
    } catch (err) {
      console.warn('Caught error in getUser:', err);
      throw err;
    }
  }

  async signInWithPassword(credentials: { email: string; password: string }) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword(credentials);
      if (error) throw error;
      return { data, error } as { data: any; error: AuthError | null };
    } catch (err) {
      console.warn('Caught error in signInWithPassword:', err);
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
      if (error) throw error;
      return { error } as { error: AuthError | null };
    } catch (err) {
      console.warn('Caught error in resetPasswordForEmail:', err);
      throw err;
    }
  }

  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      this.userSignal.set(null);
    } catch (err) {
      console.warn('Caught error in signOut:', err);
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
    } catch (err) {
      console.warn('Caught error in uploadFile:', err);
      throw err;
    }
  }

  async updatePdfPath(table: string, fileName: string) {
    try {
      const { error } = await this.client
        .from(table)
        .upsert({ pdf_path: fileName }, { onConflict: 'pdf_path' });
      if (error) throw error;
    } catch (err) {
      console.warn('Caught error in updatePdfPath:', err);
      throw err;
    }
  }

  async updateUser(updates: { password: string }) {
    try {
      console.log('Calling updateUser with updates:', updates);
      const { data, error } = await this.client.auth.updateUser(updates);
      console.log('Update User Response:', { data, error });
      if (error) throw error;
      return { data, error } as { data: any; error: AuthError | null };
    } catch (err) {
      console.warn('Caught error in updateUser:', err);
      throw err;
    }
  }
}