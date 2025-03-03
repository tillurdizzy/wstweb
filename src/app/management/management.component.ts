import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar'; // Replace MenuModule with MenubarModule
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    RouterModule,
    MenubarModule,
  ],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
})
export class ManagementComponent {
  items: MenuItem[] = [
    {
      label: 'Management',
      icon: 'pi pi-home', 
      items: [
        { 
          label: 'Information',       
          routerLink: '/management/information' 
        },
        { 
          label: 'HOA Dues', 
          routerLink: '/management/hoa-dues' 
        },
      ],
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
      ],
    },
  ];
}