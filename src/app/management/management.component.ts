import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu'; // For p-menu
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu'; // Import the Menu component type
import { MenuItem } from 'primeng/api'; // For menu items
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
  items: MenuItem[] = [
    { label: 'Information', routerLink: '/management/information' },
    { label: 'HOA Dues', routerLink: '/management/hoa-dues' },
    {
      label: 'Forms',
      items: [
        { label: 'Work Order', routerLink: '/management/forms/work-order' },
        { label: 'Resident Feedback', routerLink: '/management/forms/resident-feedback' },
        { label: 'Billing Inquiry', routerLink: '/management/forms/billing-inquiry' },
        { label: 'Violation Report', routerLink: '/management/forms/violation-report' },
        { label: 'Crime Report', routerLink: '/management/forms/crime-report' },
        { label: 'Architectural Request', routerLink: '/management/forms/arch-request' },
      ],
    },
  ];

  @ViewChild('menu') menu!: Menu; // Use the Menu type from primeng/menu

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Ensure the menu is available after the view is initialized
    console.log('Menu instance:', this.menu); // Debug to confirm
  }

  toggleMenu(event: Event) {
    this.menu.toggle(event); // Use the built-in toggle method
  }
}