import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-unit-search',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule,
  ],
  templateUrl: './unit-search.component.html',
  styleUrls: ['./unit-search.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class UnitSearchComponent {
  query = '';
  searched = false;
  searchResults: any[] = [];
  activeUnit: number | null = null;

  allUnits = [
    100, 101, 102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,
    121,122,123,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,
    200,201,202,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,
    220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,300,301,302,
    303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,
    323,324,325,326,327,328,329,330,331,332,333,334,335,336,400,401,402,403,404,405,
    406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,
    426,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,
    519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,
    539,540,541,542,543,544,545,546,547,548,549,550,551,552,553
  ];

  showAddOwnerForm: boolean = false;
  newOwner = {
    unitNumber: null as number | null,
    firstname: '',
    lastname: '',
    email: '',
    password: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  onQueryChange() {
    const q = (this.query || '').trim();
    this.activeUnit = null;
    if (q.length < 3) {
      this.searched = false;
      this.searchResults = [];
      return;
    }
    if (/^\d+$/.test(q)) {
      this.activeUnit = Number(q);
      this.searchByUnit(this.activeUnit);
    } else {
      this.searchOwners(q);
    }
  }

  clearSearch() {
    this.query = '';
    this.searched = false;
    this.searchResults = [];
    this.activeUnit = null;
  }

  async searchByUnit(unit: number) {
    this.searched = true;
    const { data, error } = await this.supabaseService.client
      .from('unit_owners')
      .select('owner_id, owners(owner_id, firstname, lastname)')
      .eq('unit', unit)
      .maybeSingle();
    if (error) {
      console.error('Error searching unit:', error.message);
      return;
    }
    if (!data?.owners) {
      this.searchResults = [];
      return;
    }
    const owner = data.owners as any;
    this.searchResults = [{ ...owner, unitCount: 1 }];
  }

  async searchOwners(q: string) {
    this.searched = true;
    const { data, error } = await this.supabaseService.client
      .from('owners')
      .select('owner_id, firstname, lastname, unit_owners(unit)')
      .or(`firstname.ilike.%${q}%,lastname.ilike.%${q}%`)
      .order('lastname');
    if (error) {
      console.error('Error searching owners:', error.message);
      return;
    }
    this.searchResults = (data || []).map((o: any) => ({
      ...o,
      unitCount: (o.unit_owners || []).length,
    }));
  }

  viewOwnerUnits(ownerId: string) {
    this.router.navigate(['/units'], { queryParams: { ownerId } });
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

  private async assignUnit(unit: number, ownerId: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('unit_owners')
      .update({ owner_id: ownerId })
      .eq('unit', unit);
    if (error) {
      throw new Error('Failed to update unit ownership: ' + error.message);
    }
  }

  async updateOwnerUnit(ownerId: string, unit: number) {
    const { data: current, error: currentError } = await this.supabaseService.client
      .from('unit_owners')
      .select('owner_id, owners(firstname, lastname, email)')
      .eq('unit', unit)
      .single();

    if (currentError) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: currentError.message });
      return;
    }

    if (current.owner_id === ownerId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Already assigned',
        detail: `This owner already owns unit ${unit}.`,
      });
      return;
    }

    const currentName = this.ownerLabel(current.owners as any);
    const target = this.searchResults.find((o) => o.owner_id === ownerId);
    const newName = target ? this.ownerLabel(target) : 'this owner';

    const ok = await this.confirm(
      `Unit ${unit} is assigned to ${currentName}. Reassign it to ${newName}?`
    );
    if (!ok) return;

    try {
      await this.assignUnit(unit, ownerId);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Unit ownership updated.' });
      this.router.navigate(['/units'], { queryParams: { ownerId } });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: (error as Error).message,
      });
    }
  }

  async addOwner() {
    const unit = this.newOwner.unitNumber;
    const email = (this.newOwner.email || '').trim();
    const firstname = (this.newOwner.firstname || '').trim();
    const lastname = (this.newOwner.lastname || '').trim();
    const password = this.newOwner.password || '';

    if (!unit || !this.allUnits.includes(unit)) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Unit', detail: 'Please enter a valid unit number.' });
      return;
    }
    if (!firstname || !lastname || !email) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Fields', detail: 'Name and email are required.' });
      return;
    }

    const { data: sessionData, error: sessionError } = await this.supabaseService.client.auth.getSession();
    if (sessionError || !sessionData.session) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Admin session not found. Log in again.' });
      return;
    }
    const adminSession = sessionData.session;

    try {
      const { data: currentLink, error: linkError } = await this.supabaseService.client
        .from('unit_owners')
        .select('unit, owner_id, owners(owner_id, firstname, lastname, email, uuid)')
        .eq('unit', unit)
        .single();

      if (linkError || !currentLink) {
        throw new Error('This unit has no unit_owners row. Every unit must already be assigned.');
      }

      const currentOwner = currentLink.owners as any;
      const currentName = this.ownerLabel(currentOwner);
      const addName = `${firstname} ${lastname}`.trim();

      const { data: emailMatches, error: emailError } = await this.supabaseService.client
        .from('owners')
        .select('owner_id, firstname, lastname, email, uuid')
        .ilike('email', email);

      if (emailError) {
        throw new Error('Error looking up email: ' + emailError.message);
      }

      const existing = emailMatches && emailMatches.length > 0 ? emailMatches[0] : null;

      if (existing && existing.owner_id === currentLink.owner_id) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Already known',
          detail: `${this.ownerLabel(existing)} is already the owner of unit ${unit}.`,
        });
        return;
      }

      if (existing) {
        const ok = await this.confirm(
          `Unit ${unit} is assigned to ${currentName}. Add unit ${unit} to ${this.ownerLabel(existing)}?`
        );
        if (!ok) return;

        if (!existing.uuid) {
          if (!password) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Password required',
              detail: 'This owner has no login yet. Enter a temporary password.',
            });
            return;
          }
          const authId = await this.signUpOwner(email, password);
          const { error: uuidError } = await this.supabaseService.client
            .from('owners')
            .update({ uuid: authId })
            .eq('owner_id', existing.owner_id);
          if (uuidError) {
            throw new Error('Linked the unit but failed to save Auth id: ' + uuidError.message);
          }
        }

        await this.assignUnit(unit, existing.owner_id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Unit ${unit} is now assigned to ${this.ownerLabel(existing)}.`,
        });
        this.toggleAddOwnerForm();
        return;
      }

      const okNew = await this.confirm(
        `Unit ${unit} is assigned to ${currentName}. Reassign it to ${addName}?`
      );
      if (!okNew) return;

      if (!password) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Password required',
          detail: 'A temporary password is required to create this owner’s login.',
        });
        return;
      }

      const authId = await this.signUpOwner(email, password);

      const { data: created, error: ownersError } = await this.supabaseService.client
        .from('owners')
        .insert({
          uuid: authId,
          firstname,
          lastname,
          email,
        })
        .select('owner_id')
        .single();

      if (ownersError || !created) {
        throw new Error('Failed to add owner: ' + (ownersError?.message || 'Unknown error'));
      }

      await this.assignUnit(unit, created.owner_id);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `${addName} added and unit ${unit} reassigned.`,
      });
      this.toggleAddOwnerForm();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: (error as Error).message || 'An unknown error occurred',
        life: 10000,
      });
    } finally {
      await this.supabaseService.client.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }
  }

  private async signUpOwner(email: string, password: string): Promise<string> {
    const tempClient = createClient(environment.supabaseUrl, environment.supabaseKey);
    const { data: authData, error: authError } = await tempClient.auth.signUp({ email, password });
    if (authError || !authData.user) {
      throw new Error('Failed to create login: ' + (authError?.message || 'Unknown error'));
    }
    return authData.user.id;
  }

  toggleAddOwnerForm() {
    this.showAddOwnerForm = !this.showAddOwnerForm;
    if (this.showAddOwnerForm) {
      this.newOwner = { unitNumber: null, firstname: '', lastname: '', email: '', password: '' };
    }
  }
}