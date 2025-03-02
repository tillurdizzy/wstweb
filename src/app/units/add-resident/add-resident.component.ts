import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms'; // For ngModel
import { RouterModule } from '@angular/router'; // For consistency
import { SupabaseService } from '../../services/supabase.service';
import { UnitService } from '../../services/unit.service';
import { Router } from '@angular/router';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-add-resident',
  standalone: true,
  imports: [CommonModule, CardModule, InputTextModule, ButtonModule, FormsModule, RouterModule, FluidModule],
  templateUrl: './add-resident.component.html',
  styleUrls: ['./add-resident.component.scss'],
})
export class AddResidentComponent {
  resident: any = { firstname: '', lastname: '', cell: '', email: '', unit: null };

  constructor(
    private supabaseService: SupabaseService,
    private unitService: UnitService,
    private router: Router
  ) {
    const selectedUnit = this.unitService.getSelectedUnit();
    if (selectedUnit !== null) {
      this.resident.unit = selectedUnit;
    }
  }

  async save() {
    if (!this.resident.firstname || !this.resident.lastname) {
      alert('First Name and Last Name are required.');
      return;
    }

    const { error } = await this.supabaseService.client
      .from('residents')
      .insert(this.resident); // id auto-generates as uuid
    if (error) {
      console.error('Error adding resident:', error.message);
      alert('Failed to add resident: ' + error.message);
    } else {
      console.log('Resident added successfully');
      this.router.navigate(['/units']);
    }
  }

  cancel() {
    this.router.navigate(['/units']);
  }
}