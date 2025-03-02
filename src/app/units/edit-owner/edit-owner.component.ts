import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms'; // For ngModel
import { SupabaseService } from '../../services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-edit-owner',
  standalone: true,
  imports: [CommonModule, CardModule, InputTextModule, ButtonModule, CheckboxModule, FormsModule, FluidModule],
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
      const { data: unitData, error: unitError } = await this.supabaseService.client
        .from('unit_owners')
        .select('unit')
        .eq('owner_id', this.owner.owner_id)
        .limit(1)
        .single();
      if (unitError) {
        console.error('Error fetching unit:', unitError.message);
        this.router.navigate(['/units']);
      } else {
        this.router.navigate(['/units'], { queryParams: { unit: unitData.unit } });
      }
    }
  }

  async cancel() {
    const { data: unitData, error: unitError } = await this.supabaseService.client
      .from('unit_owners')
      .select('unit')
      .eq('owner_id', this.owner.owner_id)
      .limit(1)
      .single();
    if (unitError) {
      console.error('Error fetching unit:', unitError.message);
      this.router.navigate(['/units']);
    } else {
      this.router.navigate(['/units'], { queryParams: { unit: unitData.unit } });
    }
  }
}