import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-governance',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule, RouterModule],
  templateUrl: './governance.component.html',
  styleUrls: ['./governance.component.scss'],
})
export class GovernanceComponent {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] = [
    {
      label: 'Governance',
      icon: 'pi pi-building',
      items: [
        {
          label: 'Board of Directors',
          icon: 'pi pi-users',
          routerLink: '/governance/board',
        },
        {
          label: 'Committees',
          icon: 'pi pi-sitemap',
          routerLink: '/governance/committees/home',
        },
        {
          label: 'Governing Documents',
          icon: 'pi pi-file',
          routerLink: '/governance/documents',
        },
      ],
    },
  ];

  toggleMenu(event: Event) {
    this.menu.toggle(event);
  }
}