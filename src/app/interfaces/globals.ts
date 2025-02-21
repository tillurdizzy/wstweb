import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
  
export class Globals {
    readonly DATA_SERVICE:string = "DataService";
    readonly ADMIN_SERVICE:string = "AdminService";
    readonly SUPABASE_SERVICE:string = "SupabaseService"
    readonly LOGIN_COMPONENT:string = "LoginComponent";
    readonly AUTH_COMPONENT:string = "AuthComponent";
    readonly OWNERS_COMPONENT:string = "OwnersComponent";
    readonly TENANTS_COMPONENT:string = "TenantsComponent";
    readonly TENANT_AUTH:string = "tenant-authenticated";
    readonly OWNER_AUTH:string = "owner-authenticated";
    readonly OWNER_TYPE:string = "owners";
    readonly TENANT_TYPE:string = "tenants";
    readonly EVENT_PROFILE:string = "profiles";
    readonly EVENT_VEHICLES:string = "vehicles"
    readonly ADMIN_UNIT_COMPONENT:string = "AdminUnitComponent"
    readonly ADMIN_COMPONENT:string = "AdminComponent"
    readonly EVENT_UNIT_CHANGE:string = "unit-change"
    readonly ADMIN_EDIT_MODE:string = "admin_edit_mode"
    readonly ADMIN_OWNER_COMPONENT:string = "Admin_OwnerProfileUpdateComp"
    readonly ADMIN_VEHICLE_COMP:string = "Admin_VehicleUpdateComp"
    readonly ADMIN_TENANT_COMPONENT:string = "UpdateTenantProfile"
    constructor() {}
}
