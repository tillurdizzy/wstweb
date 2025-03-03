import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-welcome-committee',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './committees-welcome.component.html',
  styleUrls: ['./committees-welcome.component.scss'],
})
export class WelcomeCommitteeComponent {}