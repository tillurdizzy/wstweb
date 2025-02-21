export interface IUserAccount {
  id:number,
  created_at?:string
  username: string;
  firstname: string;
  lastname: string;
  role: string;
  email: string;
  cell: string;
  street:string;
  csz:string;
  uuid:string;
  alerts:string;
  units:number[];
};

export interface IUserUpdate{
  firstname: string;
  lastname: string;
  cell: string;
  street:string;
  csz:string;

}

export interface IOwner{
  email: string;
  cell: string;
  firstname: string;
  lastname: string;
  street:string;
  csz:string;
}


