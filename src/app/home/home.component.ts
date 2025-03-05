import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { FluidModule } from 'primeng/fluid';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule,FluidModule,RouterModule], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  userEmail: string | null = null;
  isAdmin: boolean = false;

  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  async ngOnInit() {
    const { data, error } = await this.supabaseService.getUser();
    if (data?.user) {
      this.userEmail = data.user.email || 'User';
      this.isAdmin = await this.supabaseService.isAdmin();
    }
  }

  navigateToWhatsApp() {
    window.location.href = 'https://chat.whatsapp.com/Djc20BSdK3g2frto7Zv1bL';
}
}