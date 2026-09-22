import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from '../../services/unit.service';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-edit-vehicle',
  standalone: true,
  imports: [CommonModule, CardModule, InputTextModule, ButtonModule, CheckboxModule, FormsModule, RouterModule, FluidModule],
  templateUrl: './edit-vehicle.component.html',
  styleUrls: ['./edit-vehicle.component.scss'],
})
export class EditVehicleComponent implements OnInit {
  vehicle: any = { id: '', make: '', model: '', color: '', tag: '', unit: null };
  dataConfirmed: boolean = false;

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
        .select('id, make, model, color, tag, unit, data_confirmed')
        .eq('id', vehicleId)
        .single();
      if (error) {
        console.error('Error fetching vehicle:', error.message);
      } else {
        this.vehicle = data || this.vehicle;
        this.dataConfirmed = !!data.data_confirmed;
      }
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
      .update({
        make: this.vehicle.make,
        model: this.vehicle.model,
        color: this.vehicle.color,
        tag: this.vehicle.tag,
        unit: this.vehicle.unit,
        data_confirmed: this.dataConfirmed,
        updated_by: updatedBy,
      })
      .eq('id', this.vehicle.id);
    if (error) {
      alert('Failed to update vehicle: ' + error.message);
      return;
    }

    const unit = this.route.snapshot.queryParamMap.get('unit') || this.unitService.getSelectedUnit();
    this.router.navigate(['/units'], { queryParams: { unit } });
  }

  async delete() {
    const confirmDelete = confirm(`Are you sure you want to delete this vehicle (${this.vehicle.make} ${this.vehicle.model}, License: ${this.vehicle.tag})? This action cannot be undone.`);
    if (!confirmDelete) return;

    const { error } = await this.supabaseService.client
      .from('parking')
      .delete()
      .eq('id', this.vehicle.id);
    if (error) {
      alert('Failed to delete vehicle: ' + error.message);
      return;
    }

    const unit = this.route.snapshot.queryParamMap.get('unit') || this.unitService.getSelectedUnit();
    this.router.navigate(['/units'], { queryParams: { unit } });
  }

  cancel() {
    const unit = this.route.snapshot.queryParamMap.get('unit') || this.unitService.getSelectedUnit();
    this.router.navigate(['/units'], { queryParams: { unit } });
  }
}