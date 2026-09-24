import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast'; // Replaced MatDialogModule
import { MessageService } from 'primeng/api'; // For toast messages
import { FormsModule } from '@angular/forms'; // For ngModel
import { RouterModule } from '@angular/router'; // For navigation
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-work-order',
  standalone: true,
  imports: [CommonModule, CardModule, InputTextModule, ButtonModule, ToastModule, FormsModule, RouterModule, FluidModule, TextareaModule],
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss'],
  providers: [MessageService], // Provide MessageService for toast
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

  private messageService = inject(MessageService); // Inject MessageService for toast
  private router = inject(Router);

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
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Work order submitted successfully!' });
    }
  }

  cancel() {
    this.router.navigate(['/management/forms']);
  }
}