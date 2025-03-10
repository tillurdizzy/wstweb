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
    console.log('AppComponent: Hash routing enabled:', window.location.hash.startsWith('#/'));

    // Force hash routing if not applied
    if (!window.location.hash.startsWith('#/')) {
      console.log('AppComponent: Forcing hash routing redirect');
      const path = window.location.pathname === '/' ? 'login' : window.location.pathname.replace(/^\/+/, ''); // Default to /login
      this.router.navigate([path], { replaceUrl: true }).then(success => {
        console.log('Forced redirect to hash route successful:', success);
      }).catch(err => {
        console.error('Forced redirect to hash route failed:', err);
      });
    }
  }
}