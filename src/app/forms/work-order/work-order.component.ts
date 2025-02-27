import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogComponent } from '../../dialog/dialog.component'; // Import the new dialog component

@Component({
  selector: 'app-work-order',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatDialogModule,
    DialogComponent, // Use the reusable dialog
  ],
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss'],
})
export class WorkOrderComponent implements OnInit {
  workOrder: any = {
    name: '',
    phone: '',
    email: '',
    unit: null,
    description: '',
    photo: null,
    owner_id: null,
  };
  filePhoto: File | null = null;
  isMobile: boolean = false;

  @ViewChild('photoFile') photoFileInput!: ElementRef<HTMLInputElement>;

  private dialog = inject(MatDialog);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    this.isMobile = window.innerWidth < 768;
    await this.loadUserData();
  }

  async loadUserData() {
    const { data: user } = await this.supabaseService.getUser();
    if (!user?.user) {
      this.router.navigate(['']);
      return;
    }

    const { data: owner, error } = await this.supabaseService.client
      .from('owners')
      .select('owner_id, firstname, lastname, cell, email, uuid')
      .eq('uuid', user.user.id)
      .single();
    if (error) {
      console.error('Error fetching owner:', error.message);
      return;
    }

    this.workOrder.owner_id = owner.owner_id;
    this.workOrder.name = `${owner.firstname} ${owner.lastname}`;
    this.workOrder.phone = owner.cell || '';
    this.workOrder.email = owner.email || '';

    const { data: unitData, error: unitError } = await this.supabaseService.client
      .from('unit_owners')
      .select('unit')
      .eq('owner_id', owner.owner_id)
      .limit(1)
      .single();
    if (unitError) {
      console.error('Error fetching unit:', unitError.message);
    } else {
      this.workOrder.unit = unitData.unit;
    }
  }

  openPhotoFileDialog() {
    if (this.isMobile) {
      alert('Photo uploads are only available on desktop due to mobile security restrictions.');
      return;
    }
    this.photoFileInput.nativeElement.click();
  }

  onFileChangePhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.filePhoto = input.files[0];
    }
  }

  async submit() {
    if (!this.workOrder.description) {
      alert('Description of work requested is required.');
      return;
    }

    let photoUrl = null;
    if (this.filePhoto && !this.isMobile) {
      const fileName = `${Date.now()}-${this.filePhoto.name}`;
      const { data, error } = await this.supabaseService.uploadFile('work_orders', fileName, this.filePhoto);
      if (error) {
        console.error('Error uploading photo:', error.message);
        alert('Failed to upload photo: ' + error.message);
        return;
      }
      photoUrl = data;
    }

    const { error } = await this.supabaseService.client
      .from('work_orders')
      .insert({
        name: this.workOrder.name,
        phone: this.workOrder.phone,
        email: this.workOrder.email,
        unit: this.workOrder.unit,
        description: this.workOrder.description,
        photo: photoUrl,
        owner_id: this.workOrder.owner_id,
      });
    if (error) {
      console.error('Error submitting work order:', error.message);
      alert('Failed to submit work order: ' + error.message);
    } else {
      console.log('Work order submitted successfully');
      // Open reusable dialog
      this.dialog.open(DialogComponent, {
        width: '300px',
        data: { message: 'Work order submitted successfully!' },
      });
      // Auto-return after 2 seconds (handled by DialogComponent now)
    }
  }

  cancel() {
    this.router.navigate(['/management/forms']);
  }
}