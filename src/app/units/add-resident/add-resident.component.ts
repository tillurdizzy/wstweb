import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { UnitService } from '../../services/unit.service';
import { FluidModule } from 'primeng/fluid';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-resident',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    RouterModule,
    FluidModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './add-resident.component.html',
  styleUrls: ['./add-resident.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class AddResidentComponent {
  resident: any = { firstname: '', lastname: '', cell: '', email: '', unit: null };

  constructor(
    private supabaseService: SupabaseService,
    private unitService: UnitService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    const unitParam = this.route.snapshot.queryParamMap.get('unit');
    const selectedUnit = unitParam ? Number(unitParam) : this.unitService.getSelectedUnit();
    if (selectedUnit !== null) {
      this.resident.unit = selectedUnit;
    }
  }

  private confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message,
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  async save() {
    if (!this.resident.firstname || !this.resident.lastname) {
      this.messageService.add({ severity: 'warn', summary: 'Missing fields', detail: 'First name and last name are required.' });
      return;
    }
    if (!this.resident.unit) {
      this.messageService.add({ severity: 'warn', summary: 'No unit', detail: 'Open Add Resident from a unit page.' });
      return;
    }

    const ok = await this.confirm('Set this new data as confirmed?');
    if (!ok) return;

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
        data_confirmed: true,
        updated_by: updatedBy,
      });
    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      return;
    }

    this.router.navigate(['/units'], { queryParams: { unit: this.resident.unit } });
  }

  cancel() {
    this.router.navigate(['/units'], { queryParams: { unit: this.resident.unit } });
  }
}