import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MatDialogConfig} from '@angular/material/dialog';
import { DialogComponent } from '../dialog/alert/dialog.component';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthChangeEvent, AuthSession } from '@supabase/supabase-js';
import { Session, User } from '@supabase/supabase-js';
import { signal, computed } from '@angular/core';
import { IProfile, IProfileFetch } from '../interfaces/iprofile';
import { IVehicle } from '../interfaces/ivehicle';
import { IVehicleTable } from '../interfaces/ivehicle';
import { IResidentInsert, IUnit  } from '../interfaces/iunit';
import { IProfileUpdate } from '../interfaces/iprofile';
import { environment } from '../../environments/environment';
import { Globals } from '../interfaces/globals';
import { IData } from '../interfaces/idata';
import { ISpaceUpdate } from '../interfaces/ivehicle';
import { IUserAccount, IUserUpdate } from '../interfaces/iuser';
import { IWorkOrder, IBasicForm } from '../interfaces/iforms';

@Injectable({
  providedIn: 'root',
})

export class SupabaseService {
  private supabase: SupabaseClient;

  //private iProfile: IProfile;
  private vehicle: IVehicle | null = null;

  private myVehicles: IVehicle[] = [];

  private dataObj: IData = { to: '', event: '' };

  //* Observables
  _session: AuthSession | null = null;


  private currentUserSignal = signal<User | boolean>(false);
  public currentUser = this.currentUserSignal.asReadonly();
    
  setUser(user: User | boolean) {
    this.currentUserSignal.set(user);
  }

  // Get the current user value synchronously
public getUser(): User | boolean {
  return this.currentUser();
}
  
  clearUser() {
    this.currentUserSignal.set(false);
  }
  //Starts out true... if a profile exists it becomes User... if no profile yet... becomes false
  //private userProfile: BehaviorSubject<IProfile | boolean> = new BehaviorSubject(true);
  //public userProfile$ = this.userProfile.asObservable();

  dialogRef: any;

 //* >>>>>>>>>>>>>> MESSENGER <<<<<<<<<<<<<<<<
 private messageSignal = signal<any>(null);
 public message = this.messageSignal.asReadonly();

 public sendData(message: any) {
   console.log('SupabaseService > sendData >  to:' + message.to + ' event:' + message.event);
   this.messageSignal.set(message);
 }

 clearData() {
   this.messageSignal.set(null);
 }

 // Optional: If you need a computed value
 public getMessageData = computed(() => {
   return this.message();
 });

 publishData(to: string, event: string, data: any) {
   let dataObj = {
     to: to,
     event: event,
     data: data
   };
   this.sendData(dataObj);
 }
 //* >>>>>>>>>>>>>> END MESSENGER <<<<<<<<<<<<<<<<

  

  doConsole(message: string) {
    console.log(message);
  }

  showResultDialog(message:string){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = true;
      dialogConfig.hasBackdrop = false;
      dialogConfig.data = {
        title: 'Result',
        message: message,
      };
      this.dialogRef = this.dialog.open(DialogComponent, dialogConfig);
  
      setTimeout(() => {
        this.dialogRef.close();
      }, 2000);
  }

  //* >>>>>>>>>>>>>>>>>>> FETCH RESIDENT DATA <<<<<<<<<<<<<<<<<<<<<<<
  async fetchResidentProfiles(unit: number) {
    this.doConsole('SupabaseService > fetchResidentProfiles()');
    try {
      let data = await this.supabase.from('profiles').select('*').eq('unit', unit);
      this.publishData('UnitService','fetchResidentProfiles',data.data);
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }
  }

  async fetchResidentVehicles(unit: number) {
    this.doConsole('SupabaseService > fetchResidentVehicles()');
    try {
      let data = await this.supabase.from('parking').select('*').eq('unit', unit);
      if(data != null && data!=undefined){
        this.publishData('UnitService','fetchResidentVehicles',data.data);
      }
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }
  }

  async fetchUnit(unit: number) {
    this.doConsole('SupabaseService > fetchUnit()');
    try {
      let { data, error } = await this.supabase.from('units').select('*').eq('unit', unit).single();
      if(data != null){
        this.publishUnitData(data); 
      }else{
        this.showResultDialog('ERROR: ' + JSON.stringify(error))
      }
     
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }
  }

  publishUnitData(data:any) {

    this.dataObj = {
      to: 'UnitService',
      event: 'publishUnitData',
      iUnit: data,
    };
    this.sendData(this.dataObj);
    //! replace with Obsv
    /* this.dataObj = {
      to: 'DetailsComponent',
      event: 'publishUnitData',
      iUnit: data,
    };
    this.sendData(this.dataObj); */
  }



    //*>>>>>>>>>>>>>>>>>>>>  PROFILES / OWNER  <<<<<<<<<<<<<<<<<<<<
  async deleteProfile(id:number) {
    try {
      let { data, error } = await this.supabase.from('profiles').delete().eq('id', id);
      this.showResultDialog('Resident deleted.')
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }finally{
      this.router.navigate(['units/units-detail']);
    }
  }

  async insertNewProfile(profile: IProfileFetch) {
    this.doConsole('SupabaseService > insertNewProfile() profile >>' + JSON.stringify(profile));
    try {
      const { data, error } = await this.supabase.from('profiles').insert(profile);
      this.showResultDialog('New resident profile added.')
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }finally{
      this.router.navigate(['/units/units-detail']);
    }
  }

  async updateProfile(p: IProfileUpdate, id: number) {
    this.doConsole('updateProfile id = ' + id);
    try {
      const { data, error } = await this.supabase.from('profiles').update(p).eq('id',id ).select();
      if(data != null){
        let d = data[0] as IProfile;

        this.dataObj = {
          to: "UnitService",
          event: 'updateResident',
          residentUpdate:d
        };
        this.sendData(this.dataObj);
      }
      
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }finally{
      this.router.navigate(['/home']);
    }
  }
  
  async getUserAccount(user: string) {
    console.log('Supabase >> getUserAccount()');
    try {
      let { data, error } = await this.supabase.from('accounts').select('*').eq('uuid', user);
      if(data != null){
        let dataObj = {
          to: 'DataService',
          event: 'getUserAccount',
          result: data
        };
        this.sendData(dataObj);
      }
    } catch (error) {
      alert("Sign in error: getUserAccount "  + JSON.stringify(error))
    }
  }

  async updateUserAccount(updateObj: IUserUpdate,id:string){
    
    try {
      const { data, error } = await this.supabase.from('accounts')
      .update(updateObj)
      .eq('uuid', id);
      if(error == null){this.showResultDialog('User account updated.')}
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }finally{
      this.router.navigate(['/home']);
    }
  }

  async getOwnerAccount(unit:number){
    try {
      let { data, error } = await this.supabase.from('units').select('*').eq('unit', unit);
      let dataObj = {
        to: 'DataService',
        event: 'getOwnerAccount',
        result: data[0]
      };
      this.sendData(dataObj);
    } catch (error) {
      alert("Sign in error: getOwner "  + JSON.stringify(error))
    }
  }

  async updateOwnerAccount(a:IResidentInsert,units:any){
    this.doConsole('SupabaseService > updateOwnerAccount() data >>' + JSON.stringify(a));
    try {
      const { data, error } = await this.supabase.from('units')
      .update(a)
      .in('unit', units);
      if(error == null){this.showResultDialog('Owner account updated.')}
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }finally{
      this.router.navigate(['/home']);
    }
  }

  //*>>>>>>>>>>>>>>>>>> Vehicles <<<<<<<<<<<<<<<<<<<<

  async removeVehicle(id: number, unit: number) {
    let noCar = {
      name: '-',
      tag: '-',
      make: '-',
      model: '-',
      color: '-',
      link: '',
      url: '',
    };
    try {
      await this.supabase.from('parking').update(noCar).eq('id', id);
      this.dataObj = {
        to: "UnitService",
        event: 'removeVehicleSuccess!',
      };
      this.sendData(this.dataObj);
      //this.getAdminVehicles(unit);
      //this.router.navigate([this.unitsHomePath]);
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }
  };

  async updateParkingSpace(
    space: ISpaceUpdate,
    id: string,
    nav: string,
    unit: number
  ) {
    try {
      let { data, error } = await this.supabase
        .from('parking')
        .update(space)
        .eq('id', id).select();
     
     if(error == null){
      this.showResultDialog('Vehicle Updated.')
     }
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }finally{
      this.router.navigate([nav]);
    }
  };

  private setMyVehicle(data: any) {
    this.myVehicles.length = 0;
    for (var i = 0; i < data.length; i++) {
      this.vehicle = data[i];
      if(this.vehicle != undefined && this.vehicle != null){
        this.myVehicles.push(this.vehicle);
      }
    }
  };

  async updateVehicle(obj: IVehicleTable, s: number) {
    const { error } = await this.supabase
      .from('parking')
      .update(obj)
      .match({ space: s });

    if (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    } else {
      //this.getUserVehicles(this.ds.getUserUnitNumber());
    }
  }

  //* >>>>>>>>>>>>>>> UTILITIES <<<<<<<<<<<<<<<<<<<<
  // Called from LoginComponent just before signUp new account
  // supabase does not throw error when same user signs up twice--- but does not send Confirm email as stated
  async isDuplicateEmail(email: string) {
    console.log('SupabaseService > isDuplicateEmail() ' + email);
    let { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  }

  //* >>>>>>>>>>>>>>>>>>> USER / AUTH / SESSION / ACCOUNT <<<<<<<<<<<<<<<<<<<<<<<

  async loadUser() {
    if (this.currentUser.value) {// User is already set, no need to do anything else
      return;
    }
    // this will create a 401 error when no user is logged it yet-- ignore it
    const user = await this.supabase.auth.getUser();
    if (user.data.user) {
      this.currentUser.next(user.data.user);
    } else {
      this.currentUser.next(false);
    }
  }

  getCurrentUser(): Observable <User | boolean> {
    return this.currentUser.asObservable();
  }

  getCurrentUserId(): string {
    if (this.currentUser.value) {
      return (this.currentUser.value as User).id;
    } else {
      return '';
    }
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session;
    });
    return this._session;
  }

  

  // Chain of Calls... signIn >> getUserAccount >> ds.getOwner
  async signIn(credentials: { email: string; password: string }) {
    this.doConsole('Supabase > signIn() ' + JSON.stringify(credentials));
    try {
      const result = await this.supabase.auth.signInWithPassword(credentials);
      if (result.data.user == null) {
        if (result.error) {
          throw result.error.message;
        } else {
          throw new Error('Sign in failed with no user data and no error message');
        }
      }
      let dataObj = {
        to: 'DataService',
        event: 'userAuthenticated',
        result: result
      };
      this.sendData(dataObj);
    } catch (error) {
      alert("Error: " + JSON.stringify(error));
    }
  }

  async signUp(credentials: { email: string; password: string }) {
    this.doConsole('Supabase > signUp()' + JSON.stringify(credentials));
    try {
      const result = await this.supabase.auth.signUp(credentials);
      
      if (result.data.user == null) {
        // Check if error exists before accessing message
        if (result.error) {
          throw result.error.message;
        } else {
          throw new Error('Sign up failed with no user data and no error message');
        }
      } else {
        this.showResultDialog('User created: ' + result.data.user.id);
      }
    } catch (error) {
      this.showResultDialog('Error: ' + error);
    }
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    this.doConsole('SupabaseService > authChanges() ');
    return this.supabase.auth.onAuthStateChange(callback);
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  // Password Reset... this called first with only Email to initiate change
  async resetPassword(email: string ){
    try {
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:4200/password-reset'})
      if(error == null){
        this.showResultDialog('Check your email for Password Reset link.')
      }
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }finally{
      this.router.navigate(['/home']);
    }
  }

// Actual Password Update
  async updatePassword(new_password:string){
    try {
      const { data, error } = await this.supabase.auth.updateUser({password: new_password})
      if(error == null){
        this.showResultDialog('Password reset.  Please log in.')
      }
    } catch (error) {
      
    }finally{
      this.router.navigate(['/home']);
    }
  }

  
  //* >>>>>>>>>>>>  FORMS  <<<<<<<<<<<<\\
  async insertWorkOrder(wo:IWorkOrder){
    try {
      const { data, error } = await this.supabase.from('work-orders').insert(wo);
      if(error == null){
        this.showResultDialog('Work Order submitted.')
      }else{
        this.showResultDialog('ERROR: ' + JSON.stringify(error))
      }
      
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }finally{
      this.router.navigate(['/home']);
    }
  }

  async insertBasicForm(frm:IBasicForm,message:string){
    try {
      const { data, error } = await this.supabase.from('forms').insert(frm).select();
      if(error == null){
        this.showResultDialog(message)
      }else{
        this.showResultDialog('ERROR: ' + JSON.stringify(error))
      }
    } catch (error) {
      this.showResultDialog('ERROR: ' + JSON.stringify(error))
    }finally{
      this.router.navigate(['/home']);
    }
  }

  //* >>>>>>>>>>>>>>> CONSTRUCTOR / SUBSCRIPTIONS <<<<<<<<<<<<<<<<<<<<

  constructor(private router: Router,private g: Globals,private dialog: MatDialog ) {
    this.supabase = createClient(environment.supabaseUrl,environment.supabaseKey);
    this.doConsole('SupabaseService > constructor() ');
   
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, sess: Session | null) => {
      this.doConsole('Begin: SupabaseService > onAuthStateChange = ' + event + ' > currentUser = ' + (this.currentUser.value as User).id);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          let s = sess;
          if (s != null) {
            var u: User = s.user;
            this.setUser(u);
          }
        } else if(event === 'PASSWORD_RECOVERY'){

        } else {
          this.setUser(false);
        }

        this.doConsole(
          'End: SupabaseService > onAuthStateChange:event= ' + event + ' > currentUser = ' + (this.getUser)
        );
      }
    );

    // Trigger initial session load
    this.loadUser();
  }
}

