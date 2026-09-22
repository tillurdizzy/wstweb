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
  selector: 'app-edit-resident',
  standalone: true,
  imports: [CommonModule, CardModule, InputTextModule, ButtonModule, CheckboxModule, FormsModule, RouterModule, FluidModule],
  templateUrl: './edit-resident.component.html',
  styleUrls: ['./edit-resident.component.scss'],
})
export class EditResidentComponent implements OnInit {
  resident: any = { id: '', firstname: '', lastname: '', cell: '', email: '', unit: null };
  dataConfirmed: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private unitService: UnitService
  ) {}

  async ngOnInit() {
    const residentId = this.route.snapshot.paramMap.get('id');
    if (residentId) {
      const { data, error } = await this.supabaseService.client
        .from('residents')
        .select('id, firstname, lastname, cell, email, unit, data_confirmed')
        .eq('id', residentId)
        .single();
      if (error) {
        console.error('Error fetching resident:', error.message);
      } else {
        this.resident = data || this.resident;
        this.dataConfirmed = !!data.data_confirmed;
      }
    }
  }

  async save() {
    if (!this.resident.firstname || !this.resident.lastname) {
      alert('First Name and Last Name are required.');
      return;
    }

    const { data: userData } = await this.supabaseService.client.auth.getUser();
    const updatedBy = userData.user?.email || '';

    const { error } = await this.supabaseService.client
      .from('residents')
      .update({
        firstname: this.resident.firstname,
        lastname: this.resident.lastname,
        cell: this.resident.cell,
        email: this.resident.email,
        unit: this.resident.unit,
        data_confirmed: this.dataConfirmed,
        updated_by: updatedBy,
      })
      .eq('id', this.resident.id);
    if (error) {
      alert('Failed to update resident: ' + error.message);
      return;
    }

    const unit = this.route.snapshot.queryParamMap.get('unit') || this.unitService.getSelectedUnit();
    this.router.navigate(['/units'], { queryParams: { unit } });
  }

  async delete() {
    const confirmDelete = confirm(`Are you sure you want to delete ${this.resident.firstname} ${this.resident.lastname}? This action cannot be undone.`);
    if (!confirmDelete) return;

    const { error } = await this.supabaseService.client
      .from('residents')
      .delete()
      .eq('id', this.resident.id);
    if (error) {
      alert('Failed to delete resident: ' + error.message);
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