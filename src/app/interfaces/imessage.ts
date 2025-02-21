import { IProfile } from '../interfaces/iprofile';
import { IVehicle } from '../interfaces/ivehicle';
import { IUnit } from '../interfaces/iunit';
import { IResident } from '../interfaces/iresident';

export interface IMessage {
    event:string|null;
	to:string|null;

	email?:string|null;
	password?:string|null;
	unitNumber?:string|null;
	other?:string|null;
	bool?: boolean;
    iProfile?:IProfile;
	iProfiles?:IProfile[];
    iVehicle?:IVehicle;
	iVehicles?:IVehicle[];
	iUnit?:IUnit;
    iUnits?:IUnit[];
    iResident?:IResident;
	iResidents?:IResident[];
}