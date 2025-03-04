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
      icon: 'pi pi-home', // Added icon for consistency
      routerLink: '/board/home' 
    },
    { 
      label: 'Newsletter', 
      icon: 'pi pi-book', // Added icon for consistency
      routerLink: '/board/newsletter' 
    },
    { 
      label: 'Financial Reports', 
      icon: 'pi pi-chart-bar', // Added icon for consistency
      routerLink: '/board/reports' 
    },
  ];
}