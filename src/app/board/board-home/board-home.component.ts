import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-board-home',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './board-home.component.html',
  styleUrls: ['./board-home.component.scss'],
})
export class BoardHomeComponent {}