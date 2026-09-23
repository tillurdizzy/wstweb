import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-committees',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule, RouterModule],
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
})
export class CommitteesComponent {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] = [
    {
      label: 'Committees',
      icon: 'pi pi-users',
      items: [
        {
          label: 'About',
          icon: 'pi pi-info-circle',
          routerLink: '/governance/committees/home',
        },
        {
          label: 'Landscape Committee',
          icon: 'pi pi-sun',
          routerLink: '/governance/committees/landscape',
        },
        {
          label: 'Welcome Committee',
          icon: 'pi pi-users',
          routerLink: '/governance/committees/welcome',
        },
        {
          label: 'Legal Committee',
          icon: 'pi pi-hammer',
          routerLink: '/governance/committees/legal',
        },
        {
          label: 'Violations and Parking',
          icon: 'pi pi-car',
          routerLink: '/governance/committees/violations-parking',
        },
      ],
    },
  ];

  toggleMenu(event: Event) {
    this.menu.toggle(event);
  }
}