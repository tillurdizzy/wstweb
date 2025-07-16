import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthError, PostgrestError, createClient } from '@supabase/supabase-js';
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
    FormsModule,
  ],
  templateUrl: './unit-search.component.html',
  styleUrls: ['./unit-search.component.scss'],
  providers: [MessageService],
})
export class UnitSearchComponent {
  unitNumber: number | null = null;
  searchName: string = '';
  searchResults: any[] = [];
  allUnits = [
    101, 102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,
    121,122,123,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,
    200,201,202,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,
    220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,300,301,302,
    303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,
    323,324,325,326,327,328,329,330,331,332,333,334,335,336,400,401,402,403,404,405,
    406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,
    426,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,
    519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,
    539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,601,602
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
    private messageService: MessageService
  ) {}

  checkUnitNumber(): boolean {
    if (this.unitNumber !== null) {
      const unitStr = this.unitNumber.toString();
      const isValid = unitStr.length >= 3 && this.allUnits.includes(this.unitNumber);
      return isValid;
    }
    return false;
  }

  async goToUnit() {
    if (this.unitNumber !== null && this.allUnits.includes(this.unitNumber)) {
      this.router.navigate(['/units'], { queryParams: { unit: this.unitNumber } });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Unit', detail: 'Please enter a valid unit number.' });
    }
  }

  async searchOwners() {
    if (this.searchName.trim()) {
      const { data, error } = await this.supabaseService.client
        .from('owners')
        .select('owner_id, firstname, lastname')
        .or(`firstname.ilike.%${this.searchName}%,lastname.ilike.%${this.searchName}%`);
      if (error) {
        console.error('Error searching owners:', (error as PostgrestError).message);
      } else {
        this.searchResults = await Promise.all(data.map(async owner => {
          const { data: units, error: unitsError } = await this.supabaseService.client
            .from('unit_owners')
            .select('unit')
            .eq('owner_id', owner.owner_id);
          if (unitsError) {
            console.error('Error fetching units for owner:', (unitsError as PostgrestError).message);
          }
          return { ...owner, unitCount: units?.length || 0 };
        })) || [];
      }
    } else {
      this.searchResults = [];
    }
  }

  viewOwnerUnits(ownerId: string) {
    this.router.navigate(['/units'], { queryParams: { ownerId } });
  }

  async updateOwnerUnit(ownerId: string, unit: number) {
    const { data: currentOwner, error: currentError } = await this.supabaseService.client
      .from('unit_owners')
      .select('owner_id')
      .eq('unit', unit)
      .single();
    if (currentError && currentError.code !== 'PGRST116') {
      console.error('Error checking current owner:', (currentError as PostgrestError).message);
      return;
    }

    if (currentOwner) {
      await this.supabaseService.client
        .from('unit_owners')
        .delete()
        .eq('unit', unit)
        .eq('owner_id', currentOwner.owner_id);
    }

    const { error: insertError } = await this.supabaseService.client
      .from('unit_owners')
      .insert({ unit, owner_id: ownerId });
    if (insertError) {
      console.error('Error updating unit ownership:', (insertError as PostgrestError).message);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update unit ownership: ' + insertError.message });
    } else {
      console.log('Unit ownership updated successfully');
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Unit ownership updated successfully!' });
      this.router.navigate(['/units'], { queryParams: { ownerId } });
    }
  }

  async addOwner() {
    if (!this.newOwner.unitNumber || !this.allUnits.includes(this.newOwner.unitNumber)) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Unit', detail: 'Please enter a valid unit number.' });
      return;
    }
    if (!this.newOwner.firstname || !this.newOwner.lastname || !this.newOwner.email || !this.newOwner.password) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Fields', detail: 'All fields are required.' });
      return;
    }

    try {
      // Step 1: Save the current admin session
      const { data: currentSessionData, error: sessionError } = await this.supabaseService.client.auth.getSession();
      if (sessionError || !currentSessionData.session) {
        throw new Error('Failed to retrieve current admin session');
      }
      const adminSession = currentSessionData.session;

      // Step 2: Create a temporary Supabase client for signup
      const tempClient = createClient(environment.supabaseUrl, environment.supabaseKey);

      // Step 3: Check if the unit is already assigned
      const { data: currentOwner, error: currentError } = await this.supabaseService.client
        .from('unit_owners')
        .select('owner_id')
        .eq('unit', this.newOwner.unitNumber)
        .single();

      if (currentError && currentError.code !== 'PGRST116') {
        throw new Error('Error checking unit assignment: ' + currentError.message);
      }

      if (currentOwner) {
        await this.supabaseService.client
          .from('unit_owners')
          .delete()
          .eq('unit', this.newOwner.unitNumber)
          .eq('owner_id', currentOwner.owner_id);
      }

      // Step 4: Sign up the new user with the temporary client
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: this.newOwner.email,
        password: this.newOwner.password,
      });

      if (authError || !authData.user) {
        throw new Error('Failed to create user: ' + (authError?.message || 'Unknown error'));
      }

      const userId = authData.user.id;

      // Step 5: Insert into owners table
      const { data: ownersData, error: ownersError } = await this.supabaseService.client
        .from('owners')
        .insert({
          uuid: userId,
          firstname: this.newOwner.firstname,
          lastname: this.newOwner.lastname,
          email: this.newOwner.email,
        })
        .select()
        .single();

      if (ownersError || !ownersData) {
        throw new Error('Failed to add owner: ' + (ownersError?.message || 'Unknown error'));
      }

      const newOwnerId = ownersData.owner_id;

      // Step 6: Link the unit to the new owner
      const { error: unitOwnersError } = await this.supabaseService.client
        .from('unit_owners')
        .insert({
          owner_id: newOwnerId,
          unit: this.newOwner.unitNumber,
        });

      if (unitOwnersError) {
        throw new Error('Failed to link unit: ' + unitOwnersError.message);
      }

      // Step 7: Restore the admin session
      await this.supabaseService.client.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });

      // Success
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Owner added successfully!' });
      this.toggleAddOwnerForm();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: (error as Error).message || 'An unknown error occurred',
        life: 10000,
      });
    }
  }

  toggleAddOwnerForm() {
    this.showAddOwnerForm = !this.showAddOwnerForm;
    if (this.showAddOwnerForm) {
      this.newOwner = { unitNumber: null, firstname: '', lastname: '', email: '', password: '' };
    }
  }
}
