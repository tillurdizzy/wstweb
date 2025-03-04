import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-committees',
  standalone: true,
  imports: [RouterModule, MenubarModule],
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
})
export class CommitteesComponent {
  items: MenuItem[] = [
    { 
      label: 'Committees', 
      icon: 'pi pi-users',
      items: [
        { label: 'About', icon: 'pi pi-info-circle', routerLink: '/committees/home' },
        { label: 'Landscape Committee', icon: 'pi pi-leaf', routerLink: '/committees/landscape' },
        { label: 'Welcome Committee', icon: 'pi pi-users', routerLink: '/committees/welcome' },
        { label: 'Legal Committee', icon: 'pi pi-gavel', routerLink: '/committees/legal' },
        { label: 'Violations and Parking', icon: 'pi pi-car', routerLink: '/committees/violations-parking' },
      ],
    },
  ];

  // Disable default mobile collapse by setting a high breakpoint
  breakpoint: string = '9999px';

  constructor() {}
}