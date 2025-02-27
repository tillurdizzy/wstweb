import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-hoa-dues',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './hoa-dues.component.html',
  styleUrls: ['./hoa-dues.component.scss'],
})
export class HoaDuesComponent {}