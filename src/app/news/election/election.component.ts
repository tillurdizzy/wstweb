import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RouterModule } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-election',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, MenuModule, RouterModule],
  templateUrl: './election.component.html',
  styleUrls: ['./election.component.scss'],
})
export class ElectionComponent {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] = [
    {
      label: 'Elections',
      items: [
        { label: 'About', icon: 'pi pi-info-circle', routerLink: '/news/election' },
        { label: 'You Can Count on Me', icon: 'pi pi-check', routerLink: '/news/election/form' },
        { label: 'Election Flyers', icon: 'pi pi-image', routerLink: '/news/election/flyers' },
        { label: 'Bylaws Amendment', icon: 'pi pi-file-edit', routerLink: '/news/election/bylaws' },
      ],
    },
  ];

  toggleMenu(event: Event) {
    this.menu.toggle(event);
  }
}