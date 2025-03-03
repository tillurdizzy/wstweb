import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-landscape',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './committees-landscape.component.html',
  styleUrls: ['./committees-landscape.component.scss'],
})
export class LandscapeComponent {}

