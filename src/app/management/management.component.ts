import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { InformationComponent } from './information/information.component';
import { HoaDuesComponent } from './hoa-dues/hoa-dues.component';
import { FormsListComponent } from '../forms/forms-list/forms-list.component';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    InformationComponent,
    HoaDuesComponent,
    FormsListComponent,
  ],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
})
export class ManagementComponent {}