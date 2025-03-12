import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppNavComponent } from './nav/app-nav.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [AppNavComponent],
  standalone: true,
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}
  title = 'WST Owners Portal';

  ngOnInit() {
    console.log('AppComponent: Current URL:', window.location.href);
    console.log('AppComponent: Hash present:', window.location.hash.length > 0);

    // Force hash routing if no hash is present
    if (window.location.hash.length === 0) {
      console.log('AppComponent: Forcing hash routing redirect');
      const path = window.location.pathname === '/' ? 'login' : window.location.pathname.replace(/^\/+/, '');
      this.router.navigate([path], { replaceUrl: true }).then(success => {
        console.log('Forced redirect to hash route successful:', success);
      }).catch(err => {
        console.error('Forced redirect to hash route failed:', err);
      });
    }
  }
}