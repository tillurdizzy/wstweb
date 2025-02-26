import { Component } from '@angular/core';
import { AppNavComponent } from './nav/app-nav.component';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports:[AppNavComponent]
})
export class AppComponent {
  title = 'WST Owners Portal';

}
