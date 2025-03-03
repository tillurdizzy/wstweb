import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { HomeComponent } from './home/home.component';
import { UnitsComponent } from './units/units/units.component';
import { ManagementComponent } from './management/management.component';
import { InformationComponent } from './management/information/information.component';
import { HoaDuesComponent } from './management/hoa-dues/hoa-dues.component';
import { FormsListComponent } from './forms/forms-list/forms-list.component';
import { WorkOrderComponent } from './forms/work-order/work-order.component';
import { ViolationReportComponent } from './forms/violation-report/violation-report.component';
import { CrimeReportComponent } from './forms/crime-report/crime-report.component';
import { ArchRequestComponent } from './forms/arch-request/arch-request.component';
import { ResidentFeedbackComponent } from './forms/resident-feedback/resident-feedback.component';
import { BillingInquiryComponent } from './forms/billing-inquiry/billing-inquiry.component'; 
import { NavErrorComponent } from './nav/nav-error/nav-error.component';
import { authGuard } from './auth.guard';
import { NewsletterComponent } from './board/newsletter/newsletter.component';
import { ReportsComponent } from './board/reports/reports.component';
import { CommitteesComponent } from './committees/committees.component';
import { AdminComponent } from './admin/admin.component';
import { EditResidentComponent } from './units/edit-resident/edit-resident.component';
import { AddResidentComponent } from './units/add-resident/add-resident.component';
import { EditVehicleComponent } from './units/edit-vehicle/edit-vehicle.component';
import { AddVehicleComponent } from './units/add-vehicle/add-vehicle.component';
import { EditOwnerComponent } from './units/edit-owner/edit-owner.component';
import { BoardComponent } from './board/board.component';
import { BoardHomeComponent } from './board/board-home/board-home.component';
import { CommitteesHomeComponent } from './committees/committees-home/committees-home.component';
import { LandscapeComponent } from './committees/committees-landscape/committees-landscape.component';
import { WelcomeCommitteeComponent } from './committees/committees-welcome/committees-welcome.component';
import { LegalCommitteeComponent } from './committees/committees-legal/committees-legal.component';
import { ViolationsAndParkingComponent } from './committees/committees-violations/committees-violations.component';

export const routes: Routes = [
  {
    path: '',
    title: 'WST Owners Portal',
    children: [
      { path: '', component: LoginComponent },
      { path: 'home', component: HomeComponent, canActivate: [authGuard] },
      {
        path: 'management',
        component: ManagementComponent,
        canActivate: [authGuard],
        title: 'Management',
        children: [
          { path: '', redirectTo: 'information', pathMatch: 'full' },
          { path: 'information', component: InformationComponent, title: 'Information' },
          { path: 'hoa-dues', component: HoaDuesComponent, title: 'HOA Dues' },
          {
            path: 'forms',
            loadComponent: () => import('./forms/forms-list/forms-list.component').then(m => m.FormsListComponent),
            children: [
              { path: '', redirectTo: 'work-order', pathMatch: 'full' },
              { 
                path: 'work-order', 
                loadComponent: () => import('./forms/work-order/work-order.component').then(m => m.WorkOrderComponent),
                title: 'Work Order' 
              },
              { 
                path: 'violation-report', 
                loadComponent: () => import('./forms/violation-report/violation-report.component').then(m => m.ViolationReportComponent),
                title: 'Violation Report' 
              },
              { 
                path: 'crime-report', 
                loadComponent: () => import('./forms/crime-report/crime-report.component').then(m => m.CrimeReportComponent),
                title: 'Crime Report' 
              },
              { 
                path: 'arch-request', 
                loadComponent: () => import('./forms/arch-request/arch-request.component').then(m => m.ArchRequestComponent),
                title: 'Architectural Request' 
              },
              { 
                path: 'billing-inquiry', 
                loadComponent: () => import('./forms/billing-inquiry/billing-inquiry.component').then(m => m.BillingInquiryComponent),
                title: 'Billing Inquiry' 
              },
              { 
                path: 'resident-feedback', 
                loadComponent: () => import('./forms/resident-feedback/resident-feedback.component').then(m => m.ResidentFeedbackComponent),
                title: 'Resident Feedback' 
              },
            ],
          },

        ],
      },
      { path: 'board',
        loadComponent: () => import('./board/board.component').then(m => m.BoardComponent),
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { 
            path: 'home', 
            loadComponent: () => import('./board/board-home/board-home.component').then(m => m.BoardHomeComponent),
            title: 'Board Home' 
          },
          { 
            path: 'newsletter', 
            loadComponent: () => import('./board/newsletter/newsletter.component').then(m => m.NewsletterComponent),
            title: 'Newsletter' 
          },
          { 
            path: 'reports', 
            loadComponent: () => import('./board/reports/reports.component').then(m => m.ReportsComponent),
            title: 'Financial' 
          },
        ],
      },

      { path: 'committees',
        component: CommitteesComponent,
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'home', component: CommitteesHomeComponent, title: 'Committees Home' },
          { path: 'landscape', component: LandscapeComponent, title: 'Landscape Committee' },
          { path: 'welcome', component: WelcomeCommitteeComponent, title: 'Welcome Committee' },
          { path: 'legal', component: LegalCommitteeComponent, title: 'Legal Committee' },
          { path: 'violations-parking', component: ViolationsAndParkingComponent, title: 'Violations and Parking' },
        ],},
      { path: 'password-reset', title: 'Reset Password', component: PasswordResetComponent },
      { path: 'units', component: UnitsComponent, canActivate: [authGuard] },
      { path: 'edit-resident/:id', component: EditResidentComponent, canActivate: [authGuard] },
      { path: 'add-resident', component: AddResidentComponent, canActivate: [authGuard] },
      { path: 'edit-vehicle/:id', component: EditVehicleComponent, canActivate: [authGuard] },
      { path: 'add-vehicle', component: AddVehicleComponent, canActivate: [authGuard] },
      { path: 'edit-owner/:id', component: EditOwnerComponent, canActivate: [authGuard] },
      { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
      { path: '404', component: NavErrorComponent },
      { path: '**', redirectTo: '404' },
    ],
  },
];