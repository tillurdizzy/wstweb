import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { NewsletterComponent } from './newsletter/newsletter.component';
import { ReportsComponent } from './reports/reports.component';


@Component({
  selector: 'app-board',
  imports: [RouterModule,MatIconModule,MatMenuModule,MatButtonModule,
    NewsletterComponent,ReportsComponent
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})


export class BoardComponent {

}
