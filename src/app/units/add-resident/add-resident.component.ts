import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { UnitService } from '../../services/unit.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-resident',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
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