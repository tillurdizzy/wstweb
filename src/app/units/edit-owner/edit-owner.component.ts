import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FluidModule } from 'primeng/fluid';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

const TEMP_PASSWORD = '123456';

@Component({
  selector: 'app-edit-owner',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    FormsModule,
    FluidModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './edit-owner.component.html',
  styleUrls: ['./edit-owner.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class EditOwnerComponent implements OnInit {
  owner: any = { owner_id: '', firstname: '', lastname: '', email: '', cell: '', street: '', csz: '', is_admin: false };
  form: any = { firstname: '', lastname: '', email: '', cell: '', street: '', csz: '' };
  ownerOccupied: boolean = false;
  currentUnit: number | null = null;
  isAdmin: boolean = false;
  isAddingOwner: boolean = false;
  dataConfirmed: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    this.isAdmin = await this.supabaseService.isAdmin();
    const ownerId = this.route.snapshot.paramMap.get('id');
    const unitParam = this.route.snapshot.queryParamMap.get('unit');
    if (unitParam) {
      this.currentUnit = Number(unitParam);
    }

    if (ownerId) {
      const { data: ownerData, error: ownerError } = await this.supabaseService.client
        .from('owners')
        .select('owner_id, firstname, lastname, email, cell, street, csz, is_admin, data_confirmed')
        .eq('owner_id', ownerId)
        .single();
      if (ownerError) {
        console.error('Error fetching owner:', ownerError.message);
      } else {
        this.owner = ownerData || this.owner;
        this.dataConfirmed = !!ownerData.data_confirmed;
        this.copyOwnerToForm();
      }

      if (!this.currentUnit) {
        const { data: unitData, error: unitError } = await this.supabaseService.client
          .from('unit_owners')
          .select('unit')
          .eq('owner_id', ownerId)
          .limit(1)
          .single();
        if (!unitError && unitData) {
          this.currentUnit = unitData.unit;
        }
      }

      if (this.currentUnit) {
        const { data: unitDetails, error: unitDetailsError } = await this.supabaseService.client
          .from('units')
          .select('owner_occupied')
          .eq('unit', this.currentUnit)
          .single();
        if (!unitDetailsError && unitDetails) {
          this.ownerOccupied = unitDetails.owner_occupied || false;
        }
      }
    }
  }

  private copyOwnerToForm() {
    this.form = {
      firstname: this.owner.firstname || '',
      lastname: this.owner.lastname || '',
      email: this.owner.email || '',
      cell: this.owner.cell || '',
      street: this.owner.street || '',
      csz: this.owner.csz || '',
    };
  }

  startAddOwner() {
    this.isAddingOwner = true;
    this.dataConfirmed = true;
    this.form = {
      firstname: '',
      lastname: '',
      email: '',
      cell: '',
      street: '',
      csz: '',
    };
  }

  private async editorEmail(): Promise<string> {
    const { data } = await this.supabaseService.client.auth.getUser();
    return data.user?.email || '';
  }

  async save() {
    if (!this.form.firstname || !this.form.lastname) {
      this.messageService.add({ severity: 'warn', summary: 'Missing fields', detail: 'First name and last name are required.' });
      return;
    }

    const updatedBy = await this.editorEmail();

    const { error: ownersError } = await this.supabaseService.client
      .from('owners')
      .update({
        firstname: this.form.firstname,
        lastname: this.form.lastname,
        cell: this.form.cell,
        street: this.form.street,
        csz: this.form.csz,
        data_confirmed: this.dataConfirmed,
        updated_by: updatedBy,
      })
      .eq('owner_id', this.owner.owner_id);
    if (ownersError) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: ownersError.message });
      return;
    }

    if (this.currentUnit) {
      const { error: unitsError } = await this.supabaseService.client
        .from('units')
        .update({ owner_occupied: this.ownerOccupied })
        .eq('unit', this.currentUnit);
      if (unitsError) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: unitsError.message });
        return;
      }
    }

    this.router.navigate(['/units'], { queryParams: { unit: this.currentUnit } });
  }

  async cancel() {
    if (this.isAddingOwner) {
      this.isAddingOwner = false;
      this.dataConfirmed = !!this.owner.data_confirmed;
      this.copyOwnerToForm();
      return;
    }
    this.router.navigate(['/units'], { queryParams: { unit: this.currentUnit } });
  }

  private ownerLabel(row: { firstname?: string; lastname?: string; email?: string } | null): string {
    if (!row) return 'Unknown';
    const name = `${row.firstname || ''} ${row.lastname || ''}`.trim();
    return name || row.email || 'Unknown';
  }

  private confirm(message: string, header = 'Confirm'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message,
        header,
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  private async signUpOwner(email: string, password: string): Promise<string> {
    const tempClient = createClient(environment.supabaseUrl, environment.supabaseKey);
    const { data: authData, error: authError } = await tempClient.auth.signUp({ email, password });
    if (authError || !authData.user) {
      throw new Error('Failed to create login: ' + (authError?.message || 'Unknown error'));
    }
    return authData.user.id;
  }

  private async removePreviousOwnerIfOrphaned(_previousOwnerId: string): Promise<void> {
    return;
  }

  async addNewOwner() {
    if (!this.isAdmin) return;
    const unit = this.currentUnit;
    const email = (this.form.email || '').trim();
    const firstname = (this.form.firstname || '').trim();
    const lastname = (this.form.lastname || '').trim();

    if (!unit) {
      this.messageService.add({ severity: 'warn', summary: 'No unit', detail: 'Open this page from a unit so the unit number is known.' });
      return;
    }
    if (!firstname || !lastname || !email) {
      this.messageService.add({ severity: 'warn', summary: 'Missing fields', detail: 'Name and email are required.' });
      return;
    }

    const { data: sessionData, error: sessionError } = await this.supabaseService.client.auth.getSession();
    if (sessionError || !sessionData.session) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Admin session not found. Log in again.' });
      return;
    }
    const adminSession = sessionData.session;
    const previousOwnerId = this.owner.owner_id;
    const currentName = this.ownerLabel(this.owner);
    const addName = `${firstname} ${lastname}`.trim();
    const updatedBy = adminSession.user?.email || '';

    try {
      const { data: emailMatches, error: emailError } = await this.supabaseService.client
        .from('owners')
        .select('owner_id, firstname, lastname, email, uuid, is_admin')
        .ilike('email', email);
      if (emailError) throw new Error(emailError.message);

      const existing = emailMatches && emailMatches.length > 0 ? emailMatches[0] : null;

      if (existing && existing.owner_id === previousOwnerId) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Already known',
          detail: `${this.ownerLabel(existing)} is already the owner of unit ${unit}.`,
        });
        return;
      }

      if (existing) {
        const ok = await this.confirm(
          `Unit ${unit} is assigned to ${currentName}. Reassign it to ${this.ownerLabel(existing)}? The current owner will be removed if they have no other units.`
        );
        if (!ok) return;

        if (!existing.uuid) {
          const authId = await this.signUpOwner(email, TEMP_PASSWORD);
          const { error: uuidError } = await this.supabaseService.client
            .from('owners')
            .update({ uuid: authId })
            .eq('owner_id', existing.owner_id);
          if (uuidError) throw new Error(uuidError.message);
        }

        const { error: assignError } = await this.supabaseService.client
          .from('unit_owners')
          .update({ owner_id: existing.owner_id })
          .eq('unit', unit);
        if (assignError) throw new Error(assignError.message);

        await this.removePreviousOwnerIfOrphaned(previousOwnerId);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Unit ${unit} reassigned.` });
        this.router.navigate(['/units'], { queryParams: { unit } });
        return;
      }

      const okNew = await this.confirm(
        `Unit ${unit} is assigned to ${currentName}. Reassign it to ${addName}? The current owner will be removed if they have no other units.`
      );
      if (!okNew) return;

      const authId = await this.signUpOwner(email, TEMP_PASSWORD);
      const { data: created, error: ownersError } = await this.supabaseService.client
        .from('owners')
        .insert({
          uuid: authId,
          firstname,
          lastname,
          email,
          cell: this.form.cell,
          street: this.form.street,
          csz: this.form.csz,
          data_confirmed: this.dataConfirmed,
          updated_by: updatedBy,
        })
        .select('owner_id')
        .single();
      if (ownersError || !created) throw new Error(ownersError?.message || 'Failed to add owner');

      const { error: assignError } = await this.supabaseService.client
        .from('unit_owners')
        .update({ owner_id: created.owner_id })
        .eq('unit', unit);
      if (assignError) throw new Error(assignError.message);

      if (this.currentUnit) {
        await this.supabaseService.client
          .from('units')
          .update({ owner_occupied: this.ownerOccupied })
          .eq('unit', this.currentUnit);
      }

      await this.removePreviousOwnerIfOrphaned(previousOwnerId);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `${addName} now owns unit ${unit}.` });
      this.router.navigate(['/units'], { queryParams: { unit } });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: (error as Error).message,
        life: 10000,
      });
    } finally {
      await this.supabaseService.client.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }
  }
}