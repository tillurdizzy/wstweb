import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs'
import { Subject , Subscription} from 'rxjs';
import { SupabaseService } from 'src/app/services/supabase.service';
import { IUserAccount,IUserUpdate} from '../interfaces/iuser';
import { IProfile, IProfileFetch } from '../interfaces/iprofile';
import { IVehicle } from '../interfaces/ivehicle';
import { Globals } from '../interfaces/globals';
import { IResidentAccount, IResidentInsert } from '../interfaces/iunit';
import { UnitService } from './unit.service';


@Injectable({
  providedIn: "root",
})

export class DataService {

  private userid: string | null = null;
  private session:{} = {};
  private currentUser:IUserAccount | null = null;
  supaScription: Subscription;

  private userAuthenticated: boolean = false;

  private userAccount: IUserAccount = { id:0, username: '', role: '', cell: '', email: '', units: [], uuid:'' ,firstname:'',lastname:'',csz:'',street:'',alerts:''};
   //^ Not used here... used to reset ownerAccount in components
  private emptyResidentAccount: IResidentAccount[]= [{ firstname:'', lastname:'', cell: '', email: '',uuid:'', id:0, alerts:''}];
  //* ownerAccount data is taken from first item in units array from userAccount
  private residentAccounts: IResidentAccount[]= [{ firstname:'', lastname:'', cell: '', email: '',uuid:'', id:0, alerts:''}];

  private myCurrentUnit: number = 0;
  //private myVehicles: IVehicle[];
  private formList = ['Work Order','Architectural Request','Crime Report','Violation Report','Message the Board']
  private selectedForm:string = '';

  //^account$
  private accountBS: BehaviorSubject<IUserAccount> = new BehaviorSubject(this.userAccount);
  public accounts$ = this.accountBS.asObservable();

  getAccountObs(): Observable<IUserAccount> {
    return this.accounts$
  }

  setAccountObs(n:IUserAccount){
    this.accountBS.next(n);
  }

  
   //* >>>>>>>>>>>>>> MESSENGER <<<<<<<<<<<<<<<<

  private subject = new Subject<any>();

  public sendData(message: any) {
    console.log(this.g.DATA_SERVICE + ' >> sendData  to:' + message.to + ' event:' + message.event);
    this.subject.next(message);
  };

  clearData() {
    this.subject.next(null);
  };

  getData(): Observable<any> {
    return this.subject.asObservable();
  };

  //* >>>>>>>>>>>>>>> UTILITIES <<<<<<<<<<<<<<<<<<<<

  initResidentAccount(){
    return this.emptyResidentAccount;
  }

  removeNull(obj) {
    Object.keys(obj).forEach(k => {
      if (obj[k] === null || obj[k] === undefined) {
        obj[k] = '';
      }
    });
    return obj;
  };

  doConsole(message: string) {
    console.log(message);
  };

  //* >>>>>>>>>>>>>>>>>> SET <<<<<<<<<<<<<<<<<<<<<<<<<<<
  setSelectedUnit(u:string){
    this.myCurrentUnit = parseInt(u)
    console.log("DataService > setSelectedUnit() > #" + u )
  }

  setSelectedForm(f:string){
    this.selectedForm = f;
  }
  //* >>>>>>>>>>>> GETTERS / SETTERS <<<<<<<<<<<<

  isUserAuthenticated() {
    let obj = {
      'auth': this.userAuthenticated, 
      'account':this.userAccount,
    }
    return obj;
  };

  getUserAccount(){
    return this.userAccount;
  }

  getOwnerAccount(){
    return this.residentAccounts;
  }

  getOwnerRole(){
    return this.userAccount.role;
  }

 get currentUnit(){
  return this.myCurrentUnit;
 }

 getFormList(){
  return this.formList;
 }

 updateUserAccount(data:IUserUpdate){
  this.userAccount.firstname = data.firstname;
  this.userAccount.lastname = data.lastname;
  this.userAccount.cell = data.cell;
  this.userAccount.street = data.street;
  this.userAccount.csz = data.csz;
}

 get ownerUnitsList(){
  return this.userAccount.units;
 }

 //* >>>>>>>>>> SUPASCRIPTION HANDLERS >>>>>>>>>> \\

 private authenticateUser(data: any) {
  this.userAuthenticated = true;
  this.currentUser = data.data.user;
  this.session = data.session;
  let dataObj = {to: 'HomeComponent',event: 'userAuthenticated'};
  this.sendData(dataObj);
  let uid:number = 0;
  if(this.currentUser != null){
    uid = this.currentUser.id;
  }
 
  this.supabase.getUserAccount(uid);
};

private processUserAccount(data:any) {
  console.log(this.g.DATA_SERVICE + " > processUserAccount()");
  let x = data[0]
  this.userAccount.cell = x.cell;
  this.userAccount.email = x.email;
  this.userAccount.id = x.id;
  this.userAccount.uuid = x.uuid;
  this.userAccount.username = x.username;
  this.userAccount.role = x.role;
  this.userAccount.firstname = x.firstname;
  this.userAccount.lastname = x.lastname;
  this.userAccount.alerts = x.alerts;
  this.userAccount.street = x.street;
  this.userAccount.csz = x.csz;
  this.userAccount.units = x.units.units;

  if(this.userAccount.units.length > 0){
    this.myCurrentUnit = this.userAccount.units[0]
  }

  this.setAccountObs(this.userAccount);

  /* let dataObj = {
    to: 'HomeComponent',
    event: 'userAccount',
    account: this.userAccount
  }; */
  //this.sendData(dataObj);
  this.us.setUserAccount(this.userAccount);
  //! Calls for Vehicles and Residents
  this.supabase.fetchResidentProfiles(this.myCurrentUnit);
  this.supabase.fetchResidentVehicles(this.myCurrentUnit);
 
};

/* fetchResident(u:string){
  this.myCurrentUnit = parseInt(u)
  this.us.setCurrentUnit(this.myCurrentUnit);
  console.log(this.g.DATA_SERVICE + " > fetchResident-Profiles()");
  console.log(this.g.DATA_SERVICE + " > fetchResident-Vehicles()");
  this.supabase.fetchResidentProfiles(this.myCurrentUnit);
  this.supabase.fetchResidentVehicles(this.myCurrentUnit);
} */


ngOnDestroy(): void {
  this.supaScription.unsubscribe();
}


//* >>>>>>>>>>> CONSTRUCTOR / SUBSCRIPTIONS <<<<<<<<<<<<<

  constructor(private g: Globals, private supabase:SupabaseService, private us:UnitService) {
    this.doConsole('DataService > constructor()')
    this.supaScription = this.supabase.getData().subscribe(x => {
      if(x != null){
        var dataPassed = x;
        if(dataPassed.to == 'DataService'){
          console.log('DataService >> receiveData >> ' + dataPassed.event);
          if(dataPassed.event == 'userAuthenticated' ){
            this.authenticateUser(dataPassed.result)
          }else if(dataPassed.event == 'getUserAccount' ){
           this.processUserAccount(dataPassed.result)
          
          }else if(dataPassed.event == 'fetchUnit' ){
            this.processUserAccount(dataPassed.result)
           
           }
        }
      }
    })
  }
};
