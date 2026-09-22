import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { UnitService } from '../../services/unit.service';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [CommonModule, CardModule, InputTextModule, ButtonModule, CheckboxModule, FormsModule, RouterModule, FluidModule],
  templateUrl: './add-vehicle.component.html',
  styleUrls: ['./add-vehicle.component.scss'],
})
export class AddVehicleComponent {
  vehicle: any = { make: '', model: '', color: '', tag: '', unit: null };
  dataConfirmed: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private unitService: UnitService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const unitParam = this.route.snapshot.queryParamMap.get('unit');
    const selectedUnit = unitParam ? Number(unitParam) : this.unitService.getSelectedUnit();
    if (selectedUnit !== null) {
      this.vehicle.unit = selectedUnit;
    }
  }

  async save() {
    if (!this.vehicle.make || !this.vehicle.model || !this.vehicle.tag) {
      alert('Make, Model, and License are required.');
      return;
    }

    const { data: userData } = await this.supabaseService.client.auth.getUser();
    const updatedBy = userData.user?.email || '';

    const { error } = await this.supabaseService.client
      .from('parking')
      .insert({
        make: this.vehicle.make,
        model: this.vehicle.model,
        color: this.vehicle.color,
        tag: this.vehicle.tag,
        unit: this.vehicle.unit,
        data_confirmed: this.dataConfirmed,
        updated_by: updatedBy,
      });
    if (error) {
      alert('Failed to add vehicle: ' + error.message);
      return;
    }

    this.router.navigate(['/units'], { queryParams: { unit: this.vehicle.unit } });
  }

  cancel() {
    this.router.navigate(['/units'], { queryParams: { unit: this.vehicle.unit } });
  }
}