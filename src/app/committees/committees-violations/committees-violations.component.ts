import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-violations-parking',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './committees-violations.component.html',
  styleUrls: ['./committees-violations.component.scss'],
})
export class ViolationsAndParkingComponent {}
