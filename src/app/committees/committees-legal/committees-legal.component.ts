import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-legal-committee',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './committees-legal.component.html',
  styleUrls: ['./committees-legal.component.scss'],
})
export class LegalCommitteeComponent {}