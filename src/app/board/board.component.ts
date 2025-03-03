import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar'; // Replace MenuModule with MenubarModule
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    RouterModule,
    MenubarModule,
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
}