import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Location } from '@angular/common'; // Add this

@Component({
  selector: 'app-app-nav',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss'],
})
export class AppNavComponent {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private location: Location // Add this
  ) {}

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['']);
    } catch (error) {
      console.error('Logout failed:', (error as Error).message);
    }
  }

  isBackPage(): boolean {
    const currentUrl = this.router.url;
    // List of paths where we want the "Back" button instead of "Home"
    const backPages = [
      '/units',
      '/edit-resident',
      '/add-resident',
      '/edit-vehicle',
      '/add-vehicle',
      '/edit-owner',
      '/management/forms/work-order',
      '/management/forms/violation-report',
      '/management/forms/arch-request',
      '/management/forms/message-board',
    ];
    return backPages.some(path => currentUrl.startsWith(path));
  }

  goBackOrHome() {
    if (this.isBackPage()) {
      this.location.back(); // Go back in history
    } else {
      this.router.navigate(['/home']); // Default to Home
    }
  }
}