import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SupabaseService } from '../services/supabase.service';
import { Router, RouterModule } from '@angular/router';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, FluidModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  userEmail: string | null = null;
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;

  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  async ngOnInit() {
    try {
      const { data } = await this.supabaseService.getUser();
      if (data?.user) {
        this.isLoggedIn = true;
        this.userEmail = data.user.email || 'User';
        this.isAdmin = await this.supabaseService.isAdmin();
      }
    } catch {
      this.isLoggedIn = false;
    }
  }

  goToAccount() {
    this.router.navigate([this.isLoggedIn ? '/units' : '/login']);
  }

  navigateToWhatsApp() {
    window.location.href = 'https://chat.whatsapp.com/Djc20BSdK3g2frto7Zv1bL';
  }
}