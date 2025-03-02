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
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [CommonModule, CardModule, InputTextModule, ButtonModule, FormsModule, RouterModule, FluidModule],
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