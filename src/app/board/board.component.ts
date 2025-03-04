import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [RouterModule, MenubarModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
  items: MenuItem[] = [
    { 
      label: 'WST Board', 
      icon: 'pi pi-home', 
      routerLink: '/board/home' 
    },
    { 
      label: 'Newsletter', 
      icon: 'pi pi-book', 
      routerLink: '/board/newsletter' 
    },
    { 
      label: 'Financial Reports', 
      icon: 'pi pi-chart-bar', 
      routerLink: '/board/reports' 
    },
  ];

  // Disable default mobile collapse by setting a high breakpoint
  breakpoint: string = '9999px';

  constructor() {}
}