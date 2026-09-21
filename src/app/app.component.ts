import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { AppNavComponent } from './nav/app-nav.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [AppNavComponent],
  standalone: true,
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(private router: Router) {}

  ngOnInit() {
    console.log('AppComponent: Current URL:', window.location.href);
    console.log('AppComponent: Hash present:', window.location.hash.length > 0);

    // Log router events to debug navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('Router Event: NavigationStart:', event.url);
      } else {
        console.log('Router Event:', event);
      }
    });
  }

  ngAfterViewInit() {
    if (!window.location.href.includes('#/')) {
      console.log('AppComponent: Forcing hash routing rewrite');
      const path = window.location.pathname.replace(/^\/+/, '') || 'home';
      const fragment = window.location.hash.length > 0 ? window.location.hash.substring(1) : undefined;
      this.router.navigate([path], { fragment, replaceUrl: true }).then(success => {
        console.log('Forced hash route rewrite successful:', success);
      }).catch(err => {
        console.error('Forced hash route rewrite failed:', err);
      });
    }
  }
}