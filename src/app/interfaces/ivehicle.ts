export interface IVehicle {
  unit:number,
  tag: string,
  make: string,
  model: string,
  color: string,
  name: string,
  space: any,
  id:number,
  link:string,
  sort:string,
  url:string
};

export interface IVehicleTable {
  id:string;
  space: string,
  tag: string,
  make: string,
  color: string,
  model: string,
};

export interface IVehicleUpdate{
  tag: string,
  make: string,
  model: string,
  color: string,
  name: string,
  space?: any,
  id:number,
  unit:number;
};

export interface ISpace{
  tag: string,
  make: string,
  model: string,
  color: string,
  name: string,
};

export interface ISpaceUpdate{
  name: string,
  tag: string,
  make: string,
  model: string,
  color: string,

};

export interface ISpaceBasic{
  tag: string,
  make: string,
  space:string,
};

export interface IWatch{
  id?:number;
  tag: string,
  loc: string,
  created_at: string;
  user?:string;
};

