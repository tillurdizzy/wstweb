import { Routes, ResolveFn } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { HomeComponent } from "./home/home.component";
import { UnitsComponent } from "./units/units/units.component";
import { ManagementComponent } from "./management/management.component";
import { InformationComponent } from "./management/information/information.component";
import { HoaDuesComponent } from "./management/hoa-dues/hoa-dues.component";
import { NavErrorComponent } from "./nav/nav-error/nav-error.component";
import { authGuard } from "./auth.guard";
import { AdminGuard } from "./admin-guard";
import { CommitteesComponent } from "./committees/committees.component";
import { AdminComponent } from "./admin/admin.component";
import { UnitSearchComponent } from "./admin/unit-search/unit-search.component";
import { ParkingComponent } from "./admin/parking/parking.component";
import { EditResidentComponent } from "./units/edit-resident/edit-resident.component";
import { AddResidentComponent } from "./units/add-resident/add-resident.component";
import { EditVehicleComponent } from "./units/edit-vehicle/edit-vehicle.component";
import { AddVehicleComponent } from "./units/add-vehicle/add-vehicle.component";
import { EditOwnerComponent } from "./units/edit-owner/edit-owner.component";
import { CommitteesHomeComponent } from "./committees/committees-home/committees-home.component";
import { LandscapeComponent } from "./committees/committees-landscape/committees-landscape.component";
import { WelcomeCommitteeComponent } from "./committees/committees-welcome/committees-welcome.component";
import { LegalCommitteeComponent } from "./committees/committees-legal/committees-legal.component";
import { ViolationsAndParkingComponent } from "./committees/committees-violations/committees-violations.component";
import { NewsComponent } from "./news/news.component";
import { LetterComponent } from "./news/letter/letter.component";
import { EventsComponent } from "./news/events/events.component";
import { ElectionComponent } from "./news/election/election.component";
import { FlyersComponent } from "./news/election/flyers/flyers.component";
import { BylawsComponent } from "./news/election/bylaws/bylaws.component";
import { ElectionFormComponent } from "./news/election/election-form/election-form.component";
import { ActivatedRouteSnapshot } from "@angular/router";

const preserveFragmentResolver: ResolveFn<string | null> = (
  route: ActivatedRouteSnapshot
) => {
  const fragment = route.fragment;
  return fragment;
};

export const routes: Routes = [
  {
    path: "",
    title: "WST Owners Portal",
    children: [
      { path: "", redirectTo: "home", pathMatch: "full" },
      { path: "login", component: LoginComponent },
      { path: "home", component: HomeComponent },
      {
        path: "news",
        component: NewsComponent,
        children: [
          { path: "", redirectTo: "letter", pathMatch: "full" },
          { path: "letter", component: LetterComponent, title: "Newsletter" },
          { path: "events", component: EventsComponent, title: "Events" },
          { path: 'election/form', component: ElectionFormComponent, title: 'You Can Count on Me' },
          {
            path: "election",
            component: ElectionComponent,
            title: "Annual Election 2027",
          },
          {
            path: "election/flyers",
            component: FlyersComponent,
            title: "Election Flyers",
          },
          {
            path: "election/bylaws",
            component: BylawsComponent,
            title: "Bylaws Amendment",
          },
        ],
      },
      {
        path: "management",
        component: ManagementComponent,
        title: "Management",
        children: [
          { path: "", redirectTo: "information", pathMatch: "full" },
          {
            path: "information",
            component: InformationComponent,
            title: "Information",
          },
          { path: "hoa-dues", component: HoaDuesComponent, title: "HOA Dues" },
          {
            path: "forms",
            canActivate: [authGuard],
            loadComponent: () =>
              import("./forms/forms-list/forms-list.component").then(
                (m) => m.FormsListComponent
              ),
            children: [
              { path: "", redirectTo: "work-order", pathMatch: "full" },
              {
                path: "work-order",
                canActivate: [authGuard],
                loadComponent: () =>
                  import("./forms/work-order/work-order.component").then(
                    (m) => m.WorkOrderComponent
                  ),
                title: "Work Order",
              },
              {
                path: "violation-report",
                canActivate: [authGuard],
                loadComponent: () =>
                  import(
                    "./forms/violation-report/violation-report.component"
                  ).then((m) => m.ViolationReportComponent),
                title: "Violation Report",
              },
              {
                path: "crime-report",
                canActivate: [authGuard],
                loadComponent: () =>
                  import("./forms/crime-report/crime-report.component").then(
                    (m) => m.CrimeReportComponent
                  ),
                title: "Crime Report",
              },
              {
                path: "arch-request",
                canActivate: [authGuard],
                loadComponent: () =>
                  import("./forms/arch-request/arch-request.component").then(
                    (m) => m.ArchRequestComponent
                  ),
                title: "Architectural Request",
              },
              {
                path: "billing-inquiry",
                canActivate: [authGuard],
                loadComponent: () =>
                  import(
                    "./forms/billing-inquiry/billing-inquiry.component"
                  ).then((m) => m.BillingInquiryComponent),
                title: "Billing Inquiry",
              },
              {
                path: "resident-feedback",
                canActivate: [authGuard],
                loadComponent: () =>
                  import(
                    "./forms/resident-feedback/resident-feedback.component"
                  ).then((m) => m.ResidentFeedbackComponent),
                title: "Resident Feedback",
              },
            ],
          },
        ],
      },
      {
        path: "governance",
        loadComponent: () =>
          import("./governance/governance.component").then(
            (m) => m.GovernanceComponent
          ),
        children: [
          { path: "", redirectTo: "board", pathMatch: "full" },
          {
            path: "board",
            loadComponent: () =>
              import("./board/board-home/board-home.component").then(
                (m) => m.BoardHomeComponent
              ),
            title: "Board of Directors",
          },
          {
            path: "documents",
            loadComponent: () =>
              import("./governance/documents/documents.component").then(
                (m) => m.DocumentsComponent
              ),
            title: "Governing Documents",
          },
          {
            path: "committees",
            component: CommitteesComponent,
            children: [
              { path: "", redirectTo: "home", pathMatch: "full" },
              {
                path: "home",
                component: CommitteesHomeComponent,
                title: "Committees Home",
              },
              {
                path: "landscape",
                component: LandscapeComponent,
                title: "Landscape Committee",
              },
              {
                path: "welcome",
                component: WelcomeCommitteeComponent,
                title: "Welcome Committee",
              },
              {
                path: "legal",
                component: LegalCommitteeComponent,
                title: "Legal Committee",
              },
              {
                path: "violations-parking",
                component: ViolationsAndParkingComponent,
                title: "Violations and Parking",
              },
            ],
          },
        ],
      },
      { path: "board", redirectTo: "governance/board", pathMatch: "prefix" },
      {
        path: "committees",
        redirectTo: "governance/committees",
        pathMatch: "prefix",
      },
      { path: "board", redirectTo: "governance/board", pathMatch: "prefix" },
      {
        path: "password-reset",
        title: "Reset Password",
        component: PasswordResetComponent,
        resolve: { fragment: preserveFragmentResolver },
      },
      { path: "units", component: UnitsComponent, canActivate: [authGuard] },
      {
        path: "edit-resident/:id",
        component: EditResidentComponent,
        canActivate: [authGuard],
      },
      {
        path: "add-resident",
        component: AddResidentComponent,
        canActivate: [authGuard],
      },
      {
        path: "edit-vehicle/:id",
        component: EditVehicleComponent,
        canActivate: [authGuard],
      },
      {
        path: "add-vehicle",
        component: AddVehicleComponent,
        canActivate: [authGuard],
      },
      {
        path: "edit-owner/:id",
        component: EditOwnerComponent,
        canActivate: [authGuard],
      },
      {
        path: "admin",
        component: AdminComponent,
        canActivate: [authGuard, AdminGuard],
      },
      {
        path: "admin/unit-search",
        component: UnitSearchComponent,
        canActivate: [authGuard, AdminGuard],
      },
      {
        path: "admin/parking",
        component: ParkingComponent,
        canActivate: [authGuard, AdminGuard],
      },
      {
        path: "admin/super",
        loadComponent: () =>
          import("./admin/super-admin/super-admin.component").then(
            (m) => m.SuperAdminComponent
          ),
        canActivate: [authGuard, AdminGuard],
        title: "Super Admin",
      },
      { path: "404", component: NavErrorComponent },
      { path: "**", redirectTo: "404" },
    ],
  },
];
