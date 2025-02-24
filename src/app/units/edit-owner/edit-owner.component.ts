import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-owner',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, FormsModule],
  templateUrl: './edit-owner.component.html',
  styleUrls: ['./edit-owner.component.scss'],
})
export class EditOwnerComponent implements OnInit {
  owner: any = { owner_id: '', firstname: '', lastname: '', email: '', cell: '', street: '', csz: '', is_admin: false };

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const ownerId = this.route.snapshot.paramMap.get('id');
    if (ownerId) {
      const { data, error } = await this.supabaseService.client
        .from('owners')
        .select('owner_id, firstname, lastname, email, cell, street, csz, is_admin')
        .eq('owner_id', ownerId)
        .single();
      if (error) {
        console.error('Error fetching owner:', error.message);
      } else {
        this.owner = data || this.owner;
      }
    }
  }

  async save() {
    if (!this.owner.firstname || !this.owner.lastname || !this.owner.email) {
      alert('First Name, Last Name, and Email are required.');
      return;
    }

    const { error } = await this.supabaseService.client
      .from('owners')
      .update({
        firstname: this.owner.firstname,
        lastname: this.owner.lastname,
        email: this.owner.email,
        cell: this.owner.cell,
        street: this.owner.street,
        csz: this.owner.csz,
        is_admin: this.owner.is_admin,
      })
      .eq('owner_id', this.owner.owner_id);
    if (error) {
      console.error('Error updating owner:', error.message);
      alert('Failed to update owner: ' + error.message);
    } else {
      console.log('Owner updated successfully');
      // Find the unit this owner is editing (assuming one unit for simplicity)
      const { data: unitData, error: unitError } = await this.supabaseService.client
        .from('unit_owners')
        .select('unit')
        .eq('owner_id', this.owner.owner_id)
        .limit(1)
        .single();
      if (unitError) {
        console.error('Error fetching unit:', unitError.message);
        this.router.navigate(['/units']); // Fallback
      } else {
        this.router.navigate(['/units'], { queryParams: { unit: unitData.unit } });
      }
    }
  }

  async cancel() {
    // Find the unit this owner is editing when canceling
    const { data: unitData, error: unitError } = await this.supabaseService.client
      .from('unit_owners')
      .select('unit')
      .eq('owner_id', this.owner.owner_id)
      .limit(1)
      .single();
    if (unitError) {
      console.error('Error fetching unit:', unitError.message);
      this.router.navigate(['/units']); // Fallback
    } else {
      this.router.navigate(['/units'], { queryParams: { unit: unitData.unit } });
    }
  }
}