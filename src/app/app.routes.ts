import { Routes } from '@angular/router';


import { HomeComponent } from './home/home.component';

import { UnitsComponent } from './units/units/units.component';
import { DetailsComponent } from './units/details/details.component';
import { EditResidentComponent } from './units/edit-resident/edit-resident.component';
import { EditVehicleComponent } from './units/edit-vehicle/edit-vehicle.component';
import { AddVehicleComponent } from './units/add-vehicle/add-vehicle.component';
import { AddResidentComponent } from './units/add-resident/add-resident.component';

import { FormsListComponent } from './forms/forms-list/forms-list.component';
import { WorkOrderComponent } from './forms/work-order/work-order.component';
import { ArchRequestComponent } from './forms/arch-request/arch-request.component';
import { CrimeReportComponent } from './forms/crime-report/crime-report.component';
import { ViolationReportComponent } from './forms/violation-report/violation-report.component';
import { MessageComponent } from './forms/message/message.component';
import { OwnerUpdateComponent } from './forms/owner-update/owner-update.component';
import { PasswordResetComponent } from './auth/password-reset/password-reset.component';
import { UserUpdateComponent } from './forms/user-update/user-update.component';
import { NavErrorComponent } from './misc/nav-error/nav-error.component';


export const routes: Routes = [
  {
    path: '', 
    title: 'WST Owners Portal',
    children: [
      {path:'', redirectTo:'home', pathMatch:'full'},
      {path:'home', title:'Home', component: HomeComponent},
      {path:'password-reset', title:'Reset Password', component: PasswordResetComponent},
      {path:'units', component: UnitsComponent,
        children:
          [
            {path:'', redirectTo:'app-details', pathMatch:'full'},
            {path:'app-details', title:'Home', component: DetailsComponent},
            {path:'edit-resident', title:'Home', component: EditResidentComponent},
            {path:'edit-vehicle', title:'Home', component: EditVehicleComponent},
            {path:'add-resident', title:'Home', component: AddResidentComponent},
            {path:'add-vehicle', title:'Home', component: AddVehicleComponent},
          ]},
      {path:'forms', component: FormsListComponent,
      children:[
          {path:'', redirectTo:'work-order', pathMatch: 'full'},
          {path:'work-order', component: WorkOrderComponent,title:'Work Order'},
          {path:'arch-request', component: ArchRequestComponent,title:'Architectural Request'},
          {path:'crime-report', component: CrimeReportComponent,title:'Crime Report'},
          {path:'violation-report', component: ViolationReportComponent,title:'Violation Report'},
          {path:'message-board', component: MessageComponent,title:'Message Board'},
          {path:'owner-update', component: OwnerUpdateComponent,title:'Owner Update'},
          {path:'user-update', component: UserUpdateComponent,title:'User Update'},
          ]},
      {path:'404', component: NavErrorComponent },
      {path:'**', redirectTo: '404',outlet:"app"},
    ]


  }
];
