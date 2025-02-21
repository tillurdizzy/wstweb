import { IProfile,IProfileUpdate } from '../interfaces/iprofile';
import { IVehicle } from '../interfaces/ivehicle';
import { IUnit } from '../interfaces/iunit';



export interface IData {
	event:string|null;
	to:string|null;

	email?:string|null;
	password?:string|null;
	unit?:string|null;
	other?:string|null;
	bool?: boolean;
	profiles?:IProfile[];
	residentUpdate?:IProfile;
	vehicles?:IVehicle[];
	iUnit?:IUnit;
	iUnits?:IUnit[];
}
