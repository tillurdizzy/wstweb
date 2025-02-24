import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-app-nav',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss'],
})
export class AppNavComponent {
  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['']);
    } catch (error) {
      console.error('Logout failed:', (error as Error).message);
    }
  }
}