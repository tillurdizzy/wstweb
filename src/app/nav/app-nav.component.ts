import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, NavigationEnd, RouterOutlet } from '@angular/router';
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
  imports: [RouterModule, ToolbarModule, ButtonModule, DrawerModule, RippleModule, CommonModule, RouterOutlet],
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss'],
})
export class AppNavComponent implements OnInit {
  visible: boolean = false;
  expandedSubmenus: { [key: string]: boolean } = {};
  showBackToAdmin: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.refreshAuth();
    this.updateBackButton(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(async (event: NavigationEnd) => {
        await this.refreshAuth();
        this.updateBackButton(event.urlAfterRedirects);
        this.cdr.detectChanges();
      });
  }

  private async refreshAuth() {
    try {
      const { data } = await this.supabaseService.getUser();
      this.isLoggedIn = !!data?.user;
    } catch {
      this.isLoggedIn = false;
    }
  }

  private updateBackButton(url: string) {
    const path = url.split('?')[0];
    this.showBackToAdmin =
      path.startsWith('/admin/') ||
      path.startsWith('/edit-owner') ||
      path.startsWith('/edit-resident') ||
      path.startsWith('/edit-vehicle') ||
      path.startsWith('/add-resident') ||
      path.startsWith('/add-vehicle') ||
      path.startsWith('/units');
  }

  goBack() {
    const path = this.router.url.split('?')[0];
    if (path === '/units' || path.startsWith('/units')) {
      this.router.navigate(['/admin/unit-search']);
      return;
    }
    if (path.startsWith('/admin/')) {
      this.router.navigate(['/admin']);
      return;
    }
    const query = this.router.url.split('?')[1] || '';
    const unit = new URLSearchParams(query).get('unit');
    this.router.navigate(['/units'], unit ? { queryParams: { unit } } : {});
  }

  goToAccount() {
    this.visible = false;
    this.router.navigate([this.isLoggedIn ? '/units' : '/login']);
  }

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.isLoggedIn = false;
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Logout failed:', (error as Error).message);
    }
  }

  toggleDrawer() {
    this.visible = !this.visible;
  }

  toggleSubmenu(key: string) {
    this.expandedSubmenus[key] = !this.expandedSubmenus[key];
  }
}