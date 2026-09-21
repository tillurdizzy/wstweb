import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-bylaws',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, MenuModule, RouterModule],
  templateUrl: './bylaws.component.html',
  styleUrls: ['./bylaws.component.scss'],
})
export class BylawsComponent {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] = [
    {
      label: 'Elections',
      items: [
        { label: 'About', icon: 'pi pi-info-circle', routerLink: '/news/election' },
        { label: 'Election Flyers', icon: 'pi pi-image', routerLink: '/news/election/flyers' },
        { label: 'Bylaws Amendment', icon: 'pi pi-file-edit', routerLink: '/news/election/bylaws' },
      ],
    },
  ];

  toggleMenu(event: Event) {
    this.menu.toggle(event);
  }
}