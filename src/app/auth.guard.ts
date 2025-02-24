import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const { data } = await supabaseService.getUser();
  if (data?.user) {
    return true; // Allow access
  } else {
    router.navigate(['']); // Redirect to login
    return false;
  }
};