
export interface IUnit {
  unit: number;
  street: string;
  bldg:string;
  sqft:number;
  bdrms:number;
};

export interface IResidentAccount{
  id:number;
  firstname: string;
  lastname: string;
  cell: string;
  email: string;
  alerts:string;
  uuid:string;
}

export interface IResidentInsert{
  firstname: string;
  lastname: string;
  cell: string;
  email: string;
}



export interface ISelect{
  value:string;
  viewValue:string;
}