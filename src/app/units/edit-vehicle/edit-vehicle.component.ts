import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from '../../services/unit.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-vehicle',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './edit-vehicle.component.html',
  styleUrls: ['./edit-vehicle.component.scss'],
})
export class EditVehicleComponent implements OnInit {
  vehicle: any = { id: '', make: '', model: '', color: '', tag: '', unit: null };

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private unitService: UnitService
  ) {}

  async ngOnInit() {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      const { data, error } = await this.supabaseService.client
        .from('parking')
        .select('id, make, model, color, tag, unit')
        .eq('id', vehicleId)
        .single();
      if (error) {
        console.error('Error fetching vehicle:', error.message);
      } else {
        this.vehicle = data || this.vehicle;
      }
    }
  }

  async save() {
    if (!this.vehicle.make || !this.vehicle.model || !this.vehicle.tag) {
      alert('Make, Model, and License are required.');
      return;
    }

    const { error } = await this.supabaseService.client
      .from('parking')
      .update({
        make: this.vehicle.make,
        model: this.vehicle.model,
        color: this.vehicle.color,
        tag: this.vehicle.tag,
        unit: this.vehicle.unit, // Ensure unit stays linked
      })
      .eq('id', this.vehicle.id);
    if (error) {
      console.error('Error updating vehicle:', error.message);
      alert('Failed to update vehicle: ' + error.message);
    } else {
      console.log('Vehicle updated successfully');
      const unit = this.unitService.getSelectedUnit();
      this.router.navigate(['/units'], { queryParams: { unit } });
    }
  }

  cancel() {
    const unit = this.unitService.getSelectedUnit();
    this.router.navigate(['/units'], { queryParams: { unit } });
  }
}
