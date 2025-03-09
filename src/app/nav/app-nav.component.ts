import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-nav',
  standalone: true,
  imports: [RouterModule, ToolbarModule, ButtonModule, DrawerModule, RippleModule,CommonModule],
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss'],
})
export class AppNavComponent implements OnInit {
  visible: boolean = false; // Controls drawer visibility
  expandedSubmenus: { [key: string]: boolean } = {}; // Track submenu states
  showBackToAdmin: boolean = false; // Flag to control "Back to Admin" button visibility

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef // Added ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to router events to detect navigation to /admin
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Navigation to:', event.urlAfterRedirects); // Debug log
        if (event.urlAfterRedirects === '/admin') {
          this.showBackToAdmin = true; // Set flag to show the button
          console.log('showBackToAdmin set to:', this.showBackToAdmin); // Debug log
          this.cdr.detectChanges(); // Force change detection
        }
      });
  }

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['']);
      // Optionally reset showBackToAdmin on logout (if desired)
      // this.showBackToAdmin = false;
      // this.cdr.detectChanges(); // Optional: Force change detection on logout
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