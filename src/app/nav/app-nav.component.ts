import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-app-nav',
  standalone: true,
  imports: [RouterModule, ToolbarModule, ButtonModule, DrawerModule, RippleModule],
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss'],
})
export class AppNavComponent {
  visible: boolean = false; // Controls drawer visibility
  expandedSubmenus: { [key: string]: boolean } = {}; // Track submenu states

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['']);
    } catch (error) {
      console.error('Logout failed:', (error as Error).message);
    }
  }

  toggleDrawer() {
    this.visible = !this.visible; // Toggles the drawer
  }

  toggleSubmenu(key: string) {
    this.expandedSubmenus[key] = !this.expandedSubmenus[key]; // Toggle submenu visibility
  }
}