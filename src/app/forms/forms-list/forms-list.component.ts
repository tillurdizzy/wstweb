import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forms-list',
  imports: [RouterModule,MatIconModule,MatMenuModule,MatButtonModule],
  templateUrl: './forms-list.component.html',
  styleUrl: './forms-list.component.scss'
})
export class FormsListComponent {

}
