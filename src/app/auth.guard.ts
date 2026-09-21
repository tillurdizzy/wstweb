import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  try {
    const { data } = await supabaseService.getUser();
    if (data?.user) {
      return true;
    }
  } catch {
    // not signed in
  }
  router.navigate(['/login']);
  return false;
};