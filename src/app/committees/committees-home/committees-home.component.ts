import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-committees-home',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './committees-home.component.html',
  styleUrls: ['./committees-home.component.scss'],
})
export class CommitteesHomeComponent {}