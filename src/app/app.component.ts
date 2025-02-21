import { Component } from '@angular/core';
import { AppNavComponent } from './app-nav/app-nav/app-nav.component';
import { RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports:[AppNavComponent]
})
export class AppComponent {
  title = 'wstweb';

}
