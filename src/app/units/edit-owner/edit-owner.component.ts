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
  owner: any = { owner_id: '', firstname: '', lastname: '', email: '', cell: '', street: '', csz: '' };
  ownerOccupied: boolean = false; // Replace is_admin with owner_occupied

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const ownerId = this.route.snapshot.paramMap.get('id');
    if (ownerId) {
      // Fetch owner details from owners table
      const { data: ownerData, error: ownerError } = await this.supabaseService.client
        .from('owners')
        .select('owner_id, firstname, lastname, email, cell, street, csz')
        .eq('owner_id', ownerId)
        .single();
      if (ownerError) {
        console.error('Error fetching owner:', ownerError.message);
      } else {
        this.owner = ownerData || this.owner;
      }

      // Fetch owner_occupied from units table via unit_owners
      const { data: unitData, error: unitError } = await this.supabaseService.client
        .from('unit_owners')
        .select('unit')
        .eq('owner_id', ownerId)
        .limit(1)
        .single();
      if (unitError && unitError.code !== 'PGRST116') { // PGRST116 is "no rows" error
        console.error('Error fetching unit:', unitError.message);
      } else if (unitData) {
        const { data: unitDetails, error: unitDetailsError } = await this.supabaseService.client
          .from('units')
          .select('owner_occupied')
          .eq('unit', unitData.unit)
          .single();
        if (unitDetailsError) {
          console.error('Error fetching unit details:', unitDetailsError.message);
        } else {
          this.ownerOccupied = unitDetails.owner_occupied || false;
        }
      }
    }
  }

  async save() {
    if (!this.owner.firstname || !this.owner.lastname || !this.owner.email) {
      alert('First Name, Last Name, and Email are required.');
      return;
    }

    // Update owners table
    const { error: ownersError } = await this.supabaseService.client
      .from('owners')
      .update({
        firstname: this.owner.firstname,
        lastname: this.owner.lastname,
        email: this.owner.email,
        cell: this.owner.cell,
        street: this.owner.street,
        csz: this.owner.csz,
      })
      .eq('owner_id', this.owner.owner_id);
    if (ownersError) {
      console.error('Error updating owner:', ownersError.message);
      alert('Failed to update owner: ' + ownersError.message);
      return;
    }

    // Update units table with owner_occupied
    const { data: unitData, error: unitOwnerError } = await this.supabaseService.client
      .from('unit_owners')
      .select('unit')
      .eq('owner_id', this.owner.owner_id)
      .limit(1)
      .single();
    if (unitOwnerError && unitOwnerError.code !== 'PGRST116') {
      console.error('Error fetching unit for owner_occupied update:', unitOwnerError.message);
      this.router.navigate(['/units']); // Fallback to units page without query params
      return;
    } else if (unitData && unitData.unit) {
      const { error: unitsError } = await this.supabaseService.client
        .from('units')
        .update({ owner_occupied: this.ownerOccupied })
        .eq('unit', unitData.unit);
      if (unitsError) {
        console.error('Error updating unit owner_occupied:', unitsError.message);
        alert('Failed to update owner occupied status: ' + unitsError.message);
        return;
      }
    } else {
      console.warn('No unit found for owner, skipping owner_occupied update');
      // Optionally notify user or log this case
    }

    console.log('Owner and unit updated successfully');
    this.router.navigate(['/units'], { queryParams: { unit: unitData?.unit } }); // Safe navigation with optional chaining
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
      this.router.navigate(['/units']); // Fallback to units page without query params
    } else {
      this.router.navigate(['/units'], { queryParams: { unit: unitData?.unit } }); // Safe navigation with optional chaining
    }
  }
}