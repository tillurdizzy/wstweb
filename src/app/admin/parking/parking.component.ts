// src/app/admin/parking/parking.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './parking.component.html',
  styleUrls: ['./parking.component.scss']
})
export class ParkingComponent {
  searchLicense: string = '';
  licenseResults: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async searchLicenses() {
    if (this.searchLicense.trim().length >= 3) {
      const { data, error } = await this.supabaseService.client
        .from('parking')
        .select('space, tag, make, color')
        .ilike('tag', `%${this.searchLicense}%`);
      if (error) {
        console.error('Error searching licenses:', error.message);
        return;
      }
      this.licenseResults = data || [];
    } else {
      this.licenseResults = [];
    }
  }
}
