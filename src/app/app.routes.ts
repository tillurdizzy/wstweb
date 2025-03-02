import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UnitsComponent } from './units/units/units.component';
import { EditOwnerComponent } from './units/edit-owner/edit-owner.component';
import { EditResidentComponent } from './units/edit-resident/edit-resident.component';
import { EditVehicleComponent } from './units/edit-vehicle/edit-vehicle.component';
import { AddResidentComponent } from './units/add-resident/add-resident.component';
import { AddVehicleComponent } from './units/add-vehicle/add-vehicle.component';
import { ManagementComponent } from './management/management.component';
import { FormsListComponent } from './forms/forms-list/forms-list.component';
import { ArchRequestComponent } from './forms/arch-request/arch-request.component';
import { WorkOrderComponent } from './forms/work-order/work-order.component';
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
      { path: 'edit-resident/:id', component: EditResidentComponent, canActivate: [authGuard] },
      { path: 'edit-vehicle/:id', component: EditVehicleComponent, canActivate: [authGuard] },
      { path: 'add-resident', component: AddResidentComponent, canActivate: [authGuard] },
      { path: 'add-vehicle', component: AddVehicleComponent, canActivate: [authGuard] },
      {
        path: 'management',
        title: 'Management',
        component: ManagementComponent,
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'forms', pathMatch: 'full' }, // Default to forms list
          { path: 'forms', component: FormsListComponent, canActivate: [authGuard] },
          { path: 'forms/arch-request', component: ArchRequestComponent, canActivate: [authGuard] },
          { path: 'forms/work-order', component: WorkOrderComponent, canActivate: [authGuard] }, // Placeholder, adjust component
          { path: 'forms/resident-feedback', component: ArchRequestComponent, canActivate: [authGuard] }, // Placeholder
          { path: 'forms/billing-inquiry', component: ArchRequestComponent, canActivate: [authGuard] }, // Placeholder
          { path: 'forms/violation-report', component: ArchRequestComponent, canActivate: [authGuard] }, // Placeholder
          { path: 'forms/crime-report', component: ArchRequestComponent, canActivate: [authGuard] }, // Placeholder
          { path: 'forms/message-board', component: ArchRequestComponent, canActivate: [authGuard] }, // Placeholder
        ],
      },
    ],
  },
  // Add a catch-all route to redirect to login if no match
  { path: '**', redirectTo: '' },
];