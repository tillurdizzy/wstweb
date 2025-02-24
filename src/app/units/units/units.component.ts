import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Add for edit icon
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss'],
})
export class UnitsComponent implements OnInit {
  units: any[] = [];
  selectedUnit: number | null = null;
  residents: any[] = [];
  vehicles: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    const { data: user } = await this.supabaseService.getUser();
    if (user?.user) {
      const owner = await this.supabaseService.client
        .from('owners')
        .select('owner_id')
        .eq('uuid', user.user.id)
        .single();
      if (owner.data) {
        const { data, error } = await this.supabaseService.client
          .from('unit_owners')
          .select('unit')
          .eq('owner_id', owner.data.owner_id);
        if (error) {
          console.error('Error fetching units:', error.message);
        } else {
          this.units = data || [];
          if (this.units.length > 0) {
            this.selectedUnit = this.units[0].unit;
            if (this.selectedUnit !== null) {
              await this.loadUnitDetails(this.selectedUnit);
            }
          }
        }
      }
    }
  }

  async loadUnitDetails(unit: number) {
    const { data: resData, error: resError } = await this.supabaseService.client
      .from('residents')
      .select('id, firstname, lastname, cell, email') // Include id for editing
      .eq('unit', unit);
    if (resError) {
      console.error('Error fetching residents:', resError.message);
    } else {
      this.residents = resData || [];
    }

    const { data: vehData, error: vehError } = await this.supabaseService.client
      .from('parking')
      .select('id, make, model, color, tag') // Include id for editing
      .eq('unit', unit);
    if (vehError) {
      console.error('Error fetching vehicles:', vehError.message);
    } else {
      this.vehicles = vehData || [];
    }
  }

  async onUnitChange() {
    if (this.selectedUnit !== null) {
      await this.loadUnitDetails(this.selectedUnit);
    }
  }
}