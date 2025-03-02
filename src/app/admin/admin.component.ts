import { Component, ViewChild, ElementRef } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PostgrestError } from '@supabase/supabase-js';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    FormsModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  providers: [MessageService],
})
export class AdminComponent {
  unitNumber: number | null = null;
  searchName: string = '';
  searchResults: any[] = [];
  allUnits = [
    101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
    121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140,
    200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219,
    220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 300, 301, 302,
    303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322,
    323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 400, 401, 402, 403, 404, 405,
    406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425,
    426, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518,
    519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538,
    539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553
  ];
  fileNewsletter: File | null = null;
  fileReport: File | null = null;

  @ViewChild('newsletterFile') newsletterFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('reportFile') reportFileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private messageService: MessageService
  ) {}

  checkUnitNumber() {
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

  openNewsletterFileDialog() {
    this.newsletterFileInput.nativeElement.click();
  }

  openReportFileDialog() {
    this.reportFileInput.nativeElement.click();
  }

  onFileChangeNewsletter(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileNewsletter = input.files[0];
      this.uploadNewsletter();
    }
  }

  onFileChangeReport(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileReport = input.files[0];
      this.uploadReport();
    }
  }

  async uploadNewsletter() {
    if (!this.fileNewsletter) {
      this.messageService.add({ severity: 'warn', summary: 'No File', detail: 'Please select a PDF file to upload.' });
      return;
    }
    if (window.innerWidth < 768) {
      this.messageService.add({ severity: 'warn', summary: 'Mobile Restriction', detail: 'PDF uploads are only available on desktop due to mobile security restrictions.' });
      return;
    }

    console.log('Uploading newsletter:', this.fileNewsletter.name, 'to bucket:', 'newsletters');
    const fileName = `${Date.now()}-${this.fileNewsletter.name}`;
    try {
      const { data, error } = await this.supabaseService.uploadFile('newsletters', fileName, this.fileNewsletter);
      if (error) {
        console.error('Error uploading newsletter PDF:', (error as PostgrestError).message, error);
        this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: 'Failed to upload newsletter: ' + (error.message ?? 'An unknown error occurred') });
      } else {
        console.log('Upload response:', data);
        await this.supabaseService.updatePdfPath('newsletters', fileName);
        console.log('Newsletter PDF uploaded successfully to:', fileName);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Newsletter uploaded successfully!' });
      }
    } catch (error) {
      console.error('Error uploading newsletter PDF:', (error as Error).message, error);
      this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: 'Failed to upload newsletter: ' + (error as Error).message });
    }
    this.fileNewsletter = null;
  }

  async uploadReport() {
    if (!this.fileReport) {
      this.messageService.add({ severity: 'warn', summary: 'No File', detail: 'Please select a PDF file to upload.' });
      return;
    }
    if (window.innerWidth < 768) {
      this.messageService.add({ severity: 'warn', summary: 'Mobile Restriction', detail: 'PDF uploads are only available on desktop due to mobile security restrictions.' });
      return;
    }

    console.log('Uploading financial report:', this.fileReport.name, 'to bucket:', 'reports');
    const fileName = `${Date.now()}-${this.fileReport.name}`;
    try {
      const { data, error } = await this.supabaseService.uploadFile('reports', fileName, this.fileReport);
      if (error) {
        console.error('Error uploading financial report PDF:', (error as PostgrestError).message, error);
        this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: 'Failed to upload financial report: ' + (error.message ?? 'An unknown error occurred') });
      } else {
        console.log('Upload response:', data);
        await this.supabaseService.updatePdfPath('reports', fileName);
        console.log('Financial report PDF uploaded successfully to:', fileName);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Financial report uploaded successfully!' });
      }
    } catch (error) {
      console.error('Error uploading financial report PDF:', (error as Error).message, error);
      this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: 'Failed to upload financial report: ' + (error as Error).message });
    }
    this.fileReport = null;
  }
}