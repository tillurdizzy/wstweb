import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule, RouterModule],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] = [
    {
      label: 'News and Events',
      items: [
        { label: 'Newsletter', icon: 'pi pi-book', routerLink: '/news/letter' },
        { label: 'Events', icon: 'pi pi-calendar', routerLink: '/news/events' },
        { label: 'Annual Election 2027', icon: 'pi pi-star', routerLink: '/news/election' },
      ],
    },
  ];

  toggleMenu(event: Event) {
    this.menu.toggle(event);
  }
}