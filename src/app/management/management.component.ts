import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [RouterModule, MenubarModule],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
})
export class ManagementComponent {
  // Menubar items for navigation
  items: MenuItem[] = [
    { 
      label: 'Management', 
      icon: 'pi pi-cog', // Icon for Management
      items: [
        { label: 'About', icon: 'pi pi-info-circle', routerLink: '/management/information' },
        { label: 'HOA Dues', icon: 'pi pi-money-bill', routerLink: '/management/hoa-dues' },
      ]
    },
    { 
      label: 'Forms', 
      icon: 'pi pi-file-arrow-up', 
      items: [
        { label: 'Work Order', routerLink: '/management/forms/work-order' },
        { label: 'Resident Feedback', routerLink: '/management/forms/resident-feedback' },
        { label: 'Billing Inquiry', routerLink: '/management/forms/billing-inquiry' },
        { label: 'Violation Report', routerLink: '/management/forms/violation-report' },
        { label: 'Crime Report', routerLink: '/management/forms/crime-report' },
        { label: 'Architectural Request', routerLink: '/management/forms/arch-request' },
      ]
    },
  ];

  constructor() {}
}