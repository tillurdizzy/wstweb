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
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './add-vehicle.component.html',
  styleUrls: ['./add-vehicle.component.scss'],
})
export class AddVehicleComponent {
  vehicle: any = { make: '', model: '', color: '', tag: '', unit: null };

  constructor(
    private supabaseService: SupabaseService,
    private unitService: UnitService,
    private router: Router
  ) {
    const selectedUnit = this.unitService.getSelectedUnit();
    if (selectedUnit !== null) {
      this.vehicle.unit = selectedUnit;
    }
  }

  async save() {
    if (!this.vehicle.make || !this.vehicle.model || !this.vehicle.tag) {
      alert('Make, Model, and License are required.');
      return;
    }

    const { error } = await this.supabaseService.client
      .from('parking')
      .insert(this.vehicle);
    if (error) {
      console.error('Error adding vehicle:', error.message);
      alert('Failed to add vehicle: ' + error.message);
    } else {
      console.log('Vehicle added successfully');
      const unit = this.unitService.getSelectedUnit();
      this.router.navigate(['/units'], { queryParams: { unit } });
    }
  }

  cancel() {
    const unit = this.unitService.getSelectedUnit();
    this.router.navigate(['/units'], { queryParams: { unit } });
  }
}