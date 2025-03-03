import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-committees',
  standalone: true,
  imports: [
    RouterModule,
    MenubarModule,
  ],
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
})
export class CommitteesComponent {
  items: MenuItem[] = [
    {
      label: 'Committees List',
      items: [
        { label: 'Landscape', routerLink: '/committees/landscape' },
        { label: 'Welcome Committee', routerLink: '/committees/welcome' },
        { label: 'Legal Committee', routerLink: '/committees/legal' },
        { label: 'Violations and Parking', routerLink: '/committees/violations-parking' },
      ],
    },
  ];
}