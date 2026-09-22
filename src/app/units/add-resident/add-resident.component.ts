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
  selector: 'app-add-resident',
  standalone: true,
  imports: [CommonModule, CardModule, InputTextModule, ButtonModule, CheckboxModule, FormsModule, RouterModule, FluidModule],
  templateUrl: './add-resident.component.html',
  styleUrls: ['./add-resident.component.scss'],
})
export class AddResidentComponent {
  resident: any = { firstname: '', lastname: '', cell: '', email: '', unit: null };
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
      this.resident.unit = selectedUnit;
    }
  }

  async save() {
    if (!this.resident.firstname || !this.resident.lastname) {
      alert('First Name and Last Name are required.');
      return;
    }
    if (!this.resident.unit) {
      alert('Open Add Resident from a unit page.');
      return;
    }

    const { data: userData } = await this.supabaseService.client.auth.getUser();
    const updatedBy = userData.user?.email || '';

    const { error } = await this.supabaseService.client
      .from('residents')
      .insert({
        firstname: this.resident.firstname,
        lastname: this.resident.lastname,
        cell: this.resident.cell,
        email: this.resident.email,
        unit: this.resident.unit,
        data_confirmed: this.dataConfirmed,
        updated_by: updatedBy,
      });
    if (error) {
      alert('Failed to add resident: ' + error.message);
      return;
    }

    this.router.navigate(['/units'], { queryParams: { unit: this.resident.unit } });
  }

  cancel() {
    this.router.navigate(['/units'], { queryParams: { unit: this.resident.unit } });
  }
}