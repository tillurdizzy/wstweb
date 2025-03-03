import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthError, PostgrestError } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  client: SupabaseClient;
  user$ = new BehaviorSubject<any>(null);

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getUser() {
    const { data, error } = await this.client.auth.getUser();
    if (error) console.error('Error getting user:', (error as AuthError).message);
    this.user$.next(data?.user || null);
    return { data, error } as { data: any; error: AuthError | null };
  }

  async signInWithPassword(credentials: { email: string; password: string }) {
    const { data, error } = await this.client.auth.signInWithPassword(credentials);
    if (error) throw error;
    return { data, error } as { data: any; error: AuthError | null };
  }

  async resetPasswordForEmail(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`,
    });
    if (error) throw error;
    return { error } as { error: AuthError | null };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
    this.user$.next(null);
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
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    return { data: this.client.storage.from(bucket).getPublicUrl(fileName).data.publicUrl, error: null } as { data: string; error: PostgrestError | null };
  }

  async updatePdfPath(table: string, fileName: string) {
    const { error } = await this.client
      .from(table)
      .upsert({ pdf_path: fileName }, { onConflict: 'pdf_path' });
    if (error) throw error;
  }

  async updateUser(updates: { password: string }) {
    const { data, error } = await this.client.auth.updateUser(updates);
    if (error) throw error;
    return { data, error } as { data: any; error: AuthError | null };
  }
}