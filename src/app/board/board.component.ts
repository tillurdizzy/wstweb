import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu'; 
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu'; 
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MenuModule,
    RouterModule
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, AfterViewInit {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] = [
    {
      label: 'WST Board',
      icon: 'pi pi-home',
      items: [
        { 
          label: 'About', 
          icon: 'pi pi-home',
          routerLink: '/board/home',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Newsletter', 
          icon: 'pi pi-book',
          routerLink: '/board/newsletter',
          style: { 'padding-left': '20px' }
        },
        { 
          label: 'Financial Reports', 
          icon: 'pi pi-chart-bar',
          routerLink: '/board/reports',
          style: { 'padding-left': '20px' }
        }
      ]
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