import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs'
import { signal, computed, WritableSignal } from '@angular/core';
import { IUnit } from '../interfaces/iunit';
import { Globals } from '../interfaces/globals';
import { IProfile, IProfileUpdate  } from '../interfaces/iprofile';
import { ISpaceUpdate, IVehicle } from '../interfaces/ivehicle';
import { SupabaseService } from '../services/supabase.service';
import { IResidentAccount, IResidentInsert } from '../interfaces/iunit';
import { IUserAccount,IUserUpdate} from '../interfaces/iuser';

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  private supaSubscription: Subscription

  private allUnits = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
    121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 200, 201, 202,
    203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225,
    226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311,
    312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334,
    335, 336, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420,
    421, 422, 423, 424, 425, 426, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516,
    517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539,
    540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553]

  
  private unitVehicles: IVehicle[] = [];
  private unitProfiles: IProfile[] = [];

 
  //private ownerInfo: IUnit = { name: '', unit: 0, street: '', csz: '', cell: '', email: '' };
  private selectedUnit: IUnit = { unit:100, street:'',sqft:0, bdrms:1 , bldg:''};
  private userAccount: IUserAccount = { id:0, username: '', role: '', cell: '', email: '', units: [], uuid:'' ,firstname:'',lastname:'',csz:'',street:'',alerts:''};
  private emptyResidentAccount: IResidentAccount= { firstname:'', lastname:'', cell: '', email: '',uuid:'', id:0, alerts:''};
  

  // * Selected for any reason... most likely for editing
  //private selectedProfile: IProfile = { id:0, unit:0, firstname:'',lastname:'',cell:'',email:''};
  private selectedProfile: IProfile | null  = null;

  private selectedVehicle: IVehicle | null  = null;

  private currentUnit: number | null  = null;

  //* >>>>>>>>>>> SIGNALS  <<<<<<<<<<<<
  //^unit

  private unitSignal: WritableSignal<IUnit> = signal(this.selectedUnit);
  // Public read-only signal
  public unit = this.unitSignal.asReadonly();
  
  getUnit(): IUnit {
    return this.unit();
  }
  
  setUnit(u: IUnit): void {
    this.unitSignal.set(u);
  }

  //Usage in a component
//this.setUnit(newUnit);

// Getting a value synchronously
//const currentUnit = this.getUnit();

// Using in template with async pipe not needed anymore
//{{ unit() }}

  
  //^residents$
  private residentsSignal: WritableSignal<IResidentAccount[]> = signal([]);
  public residents = this.residentsSignal.asReadonly();

  getResidents(): IResidentAccount[] {
    return this.residents();
  }

  setResidents(residents: IResidentAccount[]): void {
  // Sort in descending order (larger ID first - "Primary" resident/Owner)
  const sortedResidents = [...residents].sort((a, b) => b.id - a.id);

  const { role, uuid: ownerUuid } = this.userAccount;
  let residentAccountArray: IResidentAccount[];

  switch (role) {
    case 'admin':
    case 'non-resident':
      residentAccountArray = sortedResidents.slice(0, 2);
      break;

    case 'resident':
      if (ownerUuid) {
        const clone = {
          ...this.emptyResidentAccount,
          firstname: this.userAccount.firstname,
          lastname: this.userAccount.lastname,
          cell: this.userAccount.cell,
          email: this.userAccount.email,
          id: this.userAccount.id,
          alerts: this.userAccount.alerts,
          uuid: ownerUuid
        };
        residentAccountArray = [clone, sortedResidents[1] ?? this.emptyResidentAccount];
      } else {
        residentAccountArray = [];
      }
      break;

    case 'resident +':
      if (ownerUuid && this.isResidentPlusMatch()) {
        residentAccountArray = sortedResidents.slice(0, 2);
      } else {
        residentAccountArray = [];
      }
      break;

    default:
      residentAccountArray = [];
  }

  this.residentsSignal.set(residentAccountArray);
}

// Helper method extracted for clarity
private isResidentPlusMatch(): boolean {
  const units = this.userAccount.units;
  const residesAt = this.parseObj(units, 'residesAt');
  return residesAt === this.currentUnit;
}

  //^vehicles$
  private vehiclesSignal: WritableSignal<IVehicle[]> = signal([]);
public vehicles = this.vehiclesSignal.asReadonly();

getVehicles(): IVehicle[] {
  return this.vehicles();
}

setVehicles(vehicles: IVehicle[]): void {
  // Sort in ascending order by space
  const sortedVehicles = [...vehicles].sort((a, b) => a.space - b.space);
  this.vehiclesSignal.set(sortedVehicles);
}

// Setting vehicles
//this.setVehicles(newVehiclesArray);

// Getting vehicles
//const currentVehicles = this.getVehicles();


  unitSelectionHandler(u:number){
    console.log("UnitService  > unitSelectionHandler() = " + u)
    this.currentUnit = u;
    this.supabase.fetchUnit(u);
    this.supabase.fetchResidentProfiles(this.currentUnit);
    this.supabase.fetchResidentVehicles(this.currentUnit);
  }

  updateResidentProfile(updatedProfile: IProfile): void {
    console.log("UnitService > updateResidentProfile()");
    
    // Get current residents from signal
    const currentResidents = this.residents();
    
    // Update the matching resident and create new array
    const updatedResidents = currentResidents.map(resident => {
      if (resident.id === updatedProfile.id) {
        return {
          ...resident,
          email: updatedProfile.email,
          firstname: updatedProfile.firstname,
          lastname: updatedProfile.lastname,
          cell: updatedProfile.cell
        };
      }
      return resident;
    });
  
    // Update the signal with new array
    this.residentsSignal.set(updatedResidents);
  }

  updateVehicle(aCar: ISpaceUpdate, id: string): void {
    console.log("UnitService > updateVehicle()");
    
    // Get current vehicles from signal
    const currentVehicles = this.vehicles();
    
    // Update the matching vehicle
    const updatedVehicles = currentVehicles.map(vehicle => {
      if (vehicle.id === parseInt(id)) {  // Fixed comparison operator
        return {
          ...vehicle,
          name: aCar.name,
          tag: aCar.tag,
          make: aCar.make,
          model: aCar.model,
          color: aCar.color
        };
      }
      return vehicle;
    });
  
    // Update the signal with new array
    this.vehiclesSignal.set(updatedVehicles);
  }
  
  // * >>>>>>>>>>>>>>>> Data Service <<<<<<<<<<<<<<<<<<

  private subject = new Subject<any>();

  public sendData(message: any) {
    console.log("UnitService  > sendData > message = " + JSON.stringify(message));
    this.subject.next(message);
  };

  clearData() {
    this.subject.next(null);
    this.currentUnit = null;
  };

  getData(): Observable<any> {
    return this.subject.asObservable();
  };

  //* >>>>>>>>>>>>>>>  UTILITIES <<<<<<<<<<<<<<<<<<<<<<<>

  parseObj(obj: { [key: string]: any }, key: string): any {
    let x: any;
    Object.keys(obj).forEach((k) => {
      if (k === key) {
        x = obj[k];
      }
    });
    return x;
  };

  removeNull(obj: { [key: string]: any }): any {
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

  isUnitValid(u: number): boolean {
   
    if (Number.isNaN(u)) { return false; }

    let ndx = this.allUnits.indexOf(u);
    if (ndx < 0) { return false; }

    return true;
  };

  //* SUPABASE CALLS

 

  // * SETTERS
  setUnitProfiles(data: IProfile[]) {
    this.unitProfiles = data;
  }

  setUnitVehicles(data: IVehicle[]) {
    this.unitVehicles = data;
  };

  setUserAccount(account:IUserAccount){
    this.userAccount = account;
  };
  

  setSelectedProfile(p: IProfile) {
    this.selectedProfile = p;
  };

  setSelectedVehicle(car: IVehicle) {
    this.selectedVehicle = car;
  };

  
  /* setCurrentUnit(u: number) {
    this.currentUnit = u;
    this.supabase.fetchUnit(u);
    
  }; */

  // Called ngDestroy in  AdminComponent
  resetUnitData() {
    this.unitVehicles = [];
    this.unitProfiles = [];
    this.currentUnit = 0;
    this.selectedUnit = { unit:100, street:'',sqft:0, bdrms:1 , bldg:''};
  }

  //* GETTERS

  getAdminProfiles(): IProfile[] {
    return this.unitProfiles;
  };

  getSelectedUnit(): IUnit{
    return this.selectedUnit
  }

  getUserVehicles(): IVehicle[] {
    return this.unitVehicles;
  };

  //  private selectedProfile: IProfile | null = null;
  getSelectedProfile(): IProfile | null {
      return this.selectedProfile;
  };

  getUpdateProfileID():number | undefined{
    var x:number | undefined = 0;
    if(this.selectedProfile != null){
      x = this.selectedProfile.id;
    }
    return x;
  }

  getSelectedVehicle(): IVehicle | null | undefined{
    return this.selectedVehicle;
  };

  getCurrentUnit() {
    return this.selectedUnit.unit;
  };

  getResidentID(): number | undefined{
    var x:number | undefined = 0;
    if(this.selectedProfile != undefined){
      x = this.selectedProfile.id;
    }
    return x;

  };

  isSpaceValid(space: string) {
    return true;
  };

  isSpaceAvailable(space: string) {
    return true;
  };

  ngOnDestroy(): void {
    this.supaSubscription.unsubscribe();
  }

  //* >>>>>>>>>>>>>>> CONSTRUCTOR / SUBSCRIPTIONS <<<<<<<<<<<<<<<<<<<<

  constructor(private g: Globals, private supabase: SupabaseService) {
    this.doConsole('UnitService > constructor()')

    this.supaSubscription = this.supabase.getData().subscribe(x =>{
      if(x == null){return};
      let dataPassed = x;
      let f = dataPassed.to;
      let ar = f.split(',');
      console.log('UnitService > supaSubscription = ' + dataPassed.event);
      if(ar.indexOf("UnitService") > -1){
        //* Unit/Owner
        if(dataPassed.event == 'publishUnitData'){
          this.selectedUnit = dataPassed.iUnit;
          this.setUnit(dataPassed.iUnit)
        //* Vehicles
        }else if(dataPassed.event == 'fetchResidentVehicles'){
          this.setVehicles(dataPassed.data)
          console.log('UnitService > this.setVehiclesObs(data)');
         //* Residents / Profiles  
        }else if(dataPassed.event == 'fetchResidentProfiles'){
          //this.unitProfiles = dataPassed.profiles;
          this.setResidents(dataPassed.data);
          console.log('UnitService > this.setResidentObs(data)');
        //* Residents / Delete Profile
        }else if (dataPassed.event == 'updateResidentProfile success!') {
         this.selectedProfile =  { id:0, unit:0, firstname:'',lastname:'',cell:'',email:''};

        }else if (dataPassed.event == 'removeVehicleSuccess!') {
          this.selectedVehicle = null;
         
        }else if(dataPassed.event == 'updateResident'){
          let residentProfile:IProfileUpdate = dataPassed.residentUpdate;
          this.updateResidentProfile(residentProfile);
          //! Insert into Subject
        }

      }
    }); //! End Of supaSubscription
  }
};

