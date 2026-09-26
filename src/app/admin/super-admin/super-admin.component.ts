import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { environment } from '../../../environments/environment';

const TEMP_PASSWORD = '123456';
const SUPER_ADMIN_PIN = '100';
const PIN_KEY = 'wst-super-ok';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
    FormsModule,
  ],
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.scss'],
  providers: [MessageService],
})
export class SuperAdminComponent {
  pin = '';
  unlocked = sessionStorage.getItem(PIN_KEY) === '1';

  query = '';
  searched = false;
  searchResults: any[] = [];

  selected: any = null;
  selectedUnits: { unit: number; owner_occupied: boolean }[] = [];
  editEmail = '';
  editIsAdmin = false;
  assignUnit: number | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private messageService: MessageService
  ) {}

  unlock() {
    if ((this.pin || '').trim() === SUPER_ADMIN_PIN) {
      this.unlocked = true;
      sessionStorage.setItem(PIN_KEY, '1');
      this.pin = '';
      return;
    }
    this.messageService.add({ severity: 'error', summary: 'PIN', detail: 'Incorrect PIN.' });
  }

  onQueryChange() {
    const q = (this.query || '').trim();
    if (q.length < 3) {
      this.searched = false;
      this.searchResults = [];
      return;
    }
    if (/^\d+$/.test(q)) {
      this.searchByUnit(Number(q));
    } else {
      this.searchOwners(q);
    }
  }

  clearSearch() {
    this.query = '';
    this.searched = false;
    this.searchResults = [];
    this.selected = null;
    this.selectedUnits = [];
    this.editEmail = '';
    this.editIsAdmin = false;
  }

  async searchByUnit(unit: number) {
    this.searched = true;
    const { data, error } = await this.supabaseService.client
      .from('unit_owners')
      .select('owner_id, owners(owner_id, firstname, lastname, email, uuid, is_admin)')
      .eq('unit', unit)
      .maybeSingle();
    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      return;
    }
    if (!data?.owners) {
      this.searchResults = [];
      this.selected = null;
      return;
    }
    const owner = data.owners as any;
    this.searchResults = [{ ...owner, unitCount: 1 }];
    this.selectOwner(this.searchResults[0]);
  }

  async searchOwners(q: string) {
    this.searched = true;
    const { data, error } = await this.supabaseService.client
      .from('owners')
      .select('owner_id, firstname, lastname, email, uuid, is_admin, unit_owners(unit)')
      .or(`firstname.ilike.%${q}%,lastname.ilike.%${q}%`)
      .order('lastname');
    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      return;
    }
    this.searchResults = (data || []).map((o: any) => ({
      ...o,
      unitCount: (o.unit_owners || []).length,
    }));
  }

  async selectOwner(owner: any) {
    this.selected = owner;
    this.editEmail = owner.email || '';
    this.editIsAdmin = !!owner.is_admin;

    const { data, error } = await this.supabaseService.client
      .from('unit_owners')
      .select('unit, units(unit, owner_occupied)')
      .eq('owner_id', owner.owner_id);
    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      return;
    }
    this.selectedUnits = (data || []).map((row: any) => ({
      unit: row.units?.unit ?? row.unit,
      owner_occupied: !!row.units?.owner_occupied,
    }));
  }

  private async signUpOwner(email: string): Promise<string> {
    const tempClient = createClient(environment.supabaseUrl, environment.supabaseKey);
    const { data: authData, error: authError } = await tempClient.auth.signUp({
      email,
      password: TEMP_PASSWORD,
    });
    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create login');
    }
    return authData.user.id;
  }

  async saveEmailAndAuth() {
    if (!this.selected) return;
    const email = (this.editEmail || '').trim();
    const { data: sessionData } = await this.supabaseService.client.auth.getSession();
    const adminSession = sessionData.session;
    if (!adminSession) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Admin session not found.' });
      return;
    }

    try {
      let uuid = this.selected.uuid || null;
      const createdAuth = !!(email && !uuid);
      if (createdAuth) {
        uuid = await this.signUpOwner(email);
      }

      const { error } = await this.supabaseService.client
        .from('owners')
        .update({
          email: email || null,
          uuid,
        })
        .eq('owner_id', this.selected.owner_id);
      if (error) throw new Error(error.message);

      this.selected.email = email || null;
      this.selected.uuid = uuid;

      this.messageService.add({
        severity: 'success',
        summary: 'Saved',
        detail: createdAuth
          ? `Login created. Temp password ${TEMP_PASSWORD}.`
          : uuid
            ? 'Email updated on the owner record. Existing Auth login was not changed.'
            : 'Email cleared. No Auth created.',
      });
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: (err as Error).message,
        life: 8000,
      });
    } finally {
      await this.supabaseService.client.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }
  }

  async saveAdmin() {
    if (!this.selected) return;
    const { error } = await this.supabaseService.client
      .from('owners')
      .update({ is_admin: this.editIsAdmin })
      .eq('owner_id', this.selected.owner_id);
    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      return;
    }
    this.selected.is_admin = this.editIsAdmin;
    this.messageService.add({
      severity: 'success',
      summary: 'Admin',
      detail: this.editIsAdmin ? 'Admin access on.' : 'Admin access off.',
    });
  }

  async saveOccupied(u: { unit: number; owner_occupied: boolean }) {
    const { error } = await this.supabaseService.client
      .from('units')
      .update({ owner_occupied: u.owner_occupied })
      .eq('unit', u.unit);
    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      return;
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Unit ' + u.unit,
      detail: u.owner_occupied ? 'Owner occupied' : 'Not owner occupied',
    });
  }
  async assignUnitToOwner() {
    if (!this.selected || !this.assignUnit) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Unit required',
        detail: 'Enter the unit number to assign to this owner.',
      });
      return;
    }

    const unit = Number(this.assignUnit);

    const { data: current, error: currentError } = await this.supabaseService.client
      .from('unit_owners')
      .select('unit, owner_id, owners(firstname, lastname)')
      .eq('unit', unit)
      .maybeSingle();

    if (currentError) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: currentError.message });
      return;
    }
    if (!current) {
      this.messageService.add({
        severity: 'error',
        summary: 'No unit row',
        detail: `Unit ${unit} has no unit_owners row.`,
      });
      return;
    }
    if (current.owner_id === this.selected.owner_id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Already assigned',
        detail: `This owner already owns unit ${unit}.`,
      });
      return;
    }

    const fromName = `${(current as any).owners?.firstname || ''} ${(current as any).owners?.lastname || ''}`.trim();
    if (!confirm(`Unit ${unit} is assigned to ${fromName || 'another owner'}. Reassign it to ${this.selected.firstname} ${this.selected.lastname}?`)) {
      return;
    }

    const { error } = await this.supabaseService.client
      .from('unit_owners')
      .update({ owner_id: this.selected.owner_id })
      .eq('unit', unit);

    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      return;
    }

    this.assignUnit = null;
    await this.selectOwner(this.selected);
    this.messageService.add({
      severity: 'success',
      summary: 'Assigned',
      detail: `Unit ${unit} now belongs to ${this.selected.firstname} ${this.selected.lastname}.`,
    });
  }
}