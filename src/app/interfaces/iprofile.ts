// All with ?
export interface IProfile {
  id?: number;
  unit?: number;
  firstname: string;
  lastname: string;
  cell: string;
  email: string;

}

// All columns
export interface IProfileFetch {
  id: number;
    unit: number;
    firstname: string;
    lastname: string;
    cell: string;
    email: string;
    uuid?:string;
    description?:string;
    alerts?:string;

};


// less id and unit
export interface IProfileUpdate{
  firstname: string;
  lastname: string;
  cell: string;
  email: string;

}