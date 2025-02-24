import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  userEmail: string | null = null;
  isAdmin: boolean = false;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    const { data, error } = await this.supabaseService.getUser();
    if (data?.user) {
      console.log('User ID from auth:', data.user.id); // Add this
      this.userEmail = data.user.email || 'User';
      this.isAdmin = await this.supabaseService.isAdmin();
    }
  }
}