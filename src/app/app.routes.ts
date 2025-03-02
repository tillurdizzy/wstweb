import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UnitsComponent } from './units/units/units.component';
import { EditOwnerComponent } from './units/edit-owner/edit-owner.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'WST Owners Portal',
    children: [
      { path: '', component: LoginComponent },
      { path: 'home', component: HomeComponent, canActivate: [authGuard] },
      { path: 'units', component: UnitsComponent, canActivate: [authGuard] },
      { path: 'edit-owner/:id', component: EditOwnerComponent, canActivate: [authGuard] },
    ],
  },
];