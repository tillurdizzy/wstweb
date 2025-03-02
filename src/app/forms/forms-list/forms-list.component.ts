import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router'; // For navigation
import { SupabaseService } from '../../services/supabase.service';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-forms-list',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule, FluidModule],
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss'],
})
export class FormsListComponent implements OnInit {
  forms: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    const { data, error } = await this.supabaseService.client
      .from('forms')
      .select('*');
    if (error) {
      console.error('Error fetching forms:', error.message);
    } else {
      this.forms = data || [];
    }
  }
}