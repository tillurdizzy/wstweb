import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-error',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
  ],
  templateUrl: './nav-error.component.html',
  styleUrls: ['./nav-error.component.scss'],
})
export class NavErrorComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/home']);
  }
}