import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { Location } from '@angular/common';

@Component({
  selector: 'app-app-nav',
  standalone: true,
  imports: [RouterModule, ToolbarModule, ButtonModule],
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss'],
})
export class AppNavComponent {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private location: Location
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
    const backPages = ['/units', '/edit-resident', '/add-resident', '/edit-vehicle', '/add-vehicle', '/edit-owner'];
    return backPages.some(path => currentUrl.startsWith(path));
  }

  goBackOrHome() {
    if (this.isBackPage()) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}