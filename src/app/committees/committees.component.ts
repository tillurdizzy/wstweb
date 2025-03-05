import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu'; 
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu'; 
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-committees',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MenuModule,
    RouterModule
  ],
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
})
export class CommitteesComponent implements OnInit, AfterViewInit {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] = [
    {
      label: 'Committees',
      icon: 'pi pi-users',
      items: [
        { 
          label: 'About', 
          icon: 'pi pi-info-circle', 
          routerLink: '/committees/home',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Landscape Committee', 
          icon: 'pi pi-sun', 
          routerLink: '/committees/landscape',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Welcome Committee', 
          icon: 'pi pi-users', 
          routerLink: '/committees/welcome',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Legal Committee', 
          icon: 'pi pi-hammer', 
          routerLink: '/committees/legal',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Violations and Parking', 
          icon: 'pi pi-car', 
          routerLink: '/committees/violations-parking',
          style: { 'padding-left': '20px' }
        },
      ],
    }
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