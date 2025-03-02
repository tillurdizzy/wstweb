import { Component, ViewChild } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    RouterModule,
    MenuModule,
    ButtonModule,

  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
  items: MenuItem[] = [
    {
      label: 'Newsletter',
      routerLink: '/board/newsletter',
    },
    {
      label: 'Financial Report',
      routerLink: '/board/reports',
    },
  ];

  @ViewChild('menu') menu!: Menu;

  toggleMenu(event: Event) {
    this.menu.toggle(event);
  }
}