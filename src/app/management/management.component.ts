import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu'; 
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu'; 
import { MenuItem } from 'primeng/api';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    MenuModule,
    RouterModule,
    FluidModule,
  ],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
})
export class ManagementComponent implements OnInit, AfterViewInit {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] = [
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      items: [
        { 
          label: 'Canady & Canady',   
          icon: 'pi pi-building',
          routerLink: '/management/information'
        },
        { 
          label: 'HOA Dues', 
          icon: 'pi pi-dollar',
          routerLink: '/management/hoa-dues'
        }
      ]
    },
    {
      label: 'Forms',
      icon: 'pi pi-file',
      items: [
        { 
          label: 'Work Order', 
          icon: 'pi pi-wrench',
          routerLink: '/management/forms/work-order',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Resident Feedback', 
          icon: 'pi pi-comment',
          routerLink: '/management/forms/resident-feedback',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Billing Inquiry', 
          icon: 'pi pi-question-circle',
          routerLink: '/management/forms/billing-inquiry',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Violation Report', 
          icon: 'pi pi-exclamation-triangle',
          routerLink: '/management/forms/violation-report',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Crime Report', 
          icon: 'pi pi-shield',
          routerLink: '/management/forms/crime-report',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Architectural Request', 
          icon: 'pi pi-building',
          routerLink: '/management/forms/arch-request',
          style: { 'padding-left': '20px' }
        },
      ],
    },
  ];

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    console.log('Menu instance:', this.menu);
  }

  toggleMenu(event: Event) {
    this.menu.toggle(event);
  }
}