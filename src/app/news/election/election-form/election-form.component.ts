import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-election-form',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    FluidModule,
    ToastModule,
    MenuModule,
    RouterModule,
  ],
  templateUrl: './election-form.component.html',
  styleUrls: ['./election-form.component.scss'],
  providers: [MessageService],
})
export class ElectionFormComponent {
  @ViewChild('menu') menu!: Menu;

  form = { name: '', unit: null as number | null, email: '', phone: '' };
  sending = false;

  items: MenuItem[] = [
    {
      label: 'Elections',
      items: [
        { label: 'About', icon: 'pi pi-info-circle', routerLink: '/news/election' },
        { label: 'You Can Count on Me', icon: 'pi pi-check', routerLink: '/news/election/form' },
        { label: 'Election Flyers', icon: 'pi pi-image', routerLink: '/news/election/flyers' },
        { label: 'Bylaws Amendment', icon: 'pi pi-file-edit', routerLink: '/news/election/bylaws' },
      ],
    },
  ];

  constructor(
    private supabase: SupabaseService,
    private messageService: MessageService
  ) {}

  toggleMenu(event: Event) {
    this.menu.toggle(event);
  }

  async submit() {
    const name = (this.form.name || '').trim();
    const email = (this.form.email || '').trim();
    const phone = (this.form.phone || '').trim();
    const unit = this.form.unit;

    if (!name || !email || !phone || !unit) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing fields',
        detail: 'Name, unit, email, and phone are required.',
      });
      return;
    }

    this.sending = true;
    const { error } = await this.supabase.client.from('election').insert({
      name,
      email,
      phone,
      unit,
    });
    this.sending = false;

    if (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      return;
    }

    this.form = { name: '', unit: null, email: '', phone: '' };
    this.messageService.add({
      severity: 'success',
      summary: 'Thank you',
      detail: 'We have your information and will count on you.',
    });
  }
}