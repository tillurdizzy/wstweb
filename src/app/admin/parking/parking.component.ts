

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'ParkingComponent',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="condition">Content to show</div>
  `,
})
export class ParkingComponent {
  condition = true;
}

