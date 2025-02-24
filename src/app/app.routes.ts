import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { HomeComponent } from './home/home.component';
import { UnitsComponent } from './units/units/units.component';
import { FormsListComponent } from './forms/forms-list/forms-list.component';
import { WorkOrderComponent } from './forms/work-order/work-order.component';
import { ArchRequestComponent } from './forms/arch-request/arch-request.component';
import { CrimeReportComponent } from './forms/crime-report/crime-report.component';
import { ViolationReportComponent } from './forms/violation-report/violation-report.component';
import { MessageComponent } from './forms/message/message.component';
import { OwnerUpdateComponent } from './forms/owner-update/owner-update.component';
import { UserUpdateComponent } from './forms/user-update/user-update.component';
import { NavErrorComponent } from './nav/nav-error/nav-error.component';
import { authGuard } from './auth.guard';
import { PresidentComponent } from './home/president/president.component';
import { ReportsComponent } from './home/reports/reports.component';
import { CommitteesComponent } from './home/committees/committees.component';
import { AdminComponent } from './admin/admin.component';
import { EditResidentComponent } from './units/edit-resident/edit-resident.component';
import { AddResidentComponent } from './units/add-resident/add-resident.component';
import { EditVehicleComponent } from './units/edit-vehicle/edit-vehicle.component';
import { AddVehicleComponent } from './units/add-vehicle/add-vehicle.component';

export const routes: Routes = [
  {
    path: '',
    title: 'WST Owners Portal',
    children: [
      { path: '', component: LoginComponent },
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuard],
        children: [
          { path: 'president', component: PresidentComponent },
          { path: 'reports', component: ReportsComponent },
          { path: 'committees', component: CommitteesComponent },
        ],
      },
      { path: 'password-reset', title: 'Reset Password', component: PasswordResetComponent },
      { path: 'units', component: UnitsComponent, canActivate: [authGuard] }, // No children now
      {
        path: 'forms',
        component: FormsListComponent,
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'work-order', pathMatch: 'full' },
          { path: 'work-order', component: WorkOrderComponent, title: 'Work Order' },
          { path: 'arch-request', component: ArchRequestComponent, title: 'Architectural Request' },
          { path: 'crime-report', component: CrimeReportComponent, title: 'Crime Report' },
          { path: 'violation-report', component: ViolationReportComponent, title: 'Violation Report' },
          { path: 'message-board', component: MessageComponent, title: 'Message Board' },
          { path: 'owner-update', component: OwnerUpdateComponent, title: 'Owner Update' },
          { path: 'user-update', component: UserUpdateComponent, title: 'User Update' },
        ],
      },
      { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
      { path: 'edit-resident/:id', component: EditResidentComponent, canActivate: [authGuard] },
      { path: 'add-resident', component: AddResidentComponent, canActivate: [authGuard] },
      { path: 'edit-vehicle/:id', component: EditVehicleComponent, canActivate: [authGuard] },
      { path: 'add-vehicle', component: AddVehicleComponent, canActivate: [authGuard] },
      { path: '404', component: NavErrorComponent },
      { path: '**', redirectTo: '404' },
    ],
  },
];