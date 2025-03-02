import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-hoa-dues',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './hoa-dues.component.html',
  styleUrls: ['./hoa-dues.component.scss'],
})
export class HoaDuesComponent {}