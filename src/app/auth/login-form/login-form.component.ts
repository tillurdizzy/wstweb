import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { IData } from '../../interfaces/idata';
//import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-login-form',
  imports: [],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent implements OnInit {
  dataObj = {} as IData;
  //loginMode = "UP" // Development only to sign up users: Production should be "IN"
  loginMode = "IN"
  pageTitle:string = "Sign In"
  buttonLabel = "Sign In"

  //! Default password : 'wstadmin'
  //! foe ME personallu wstadmin9954
  myForm = new FormGroup({
    ownerEmail: new FormControl<string>(''),
    ownerPassword: new FormControl<string>('')

   // ownerEmail: new FormControl<string>('tillurdizzy@live.com'),
    //ownerPassword: new FormControl<string>('wstadmin9954')

    //ownerEmail: new FormControl<string>('toddneal@rpmhoustonassociates.com'),
    //ownerPassword: new FormControl<string>('wstadmin')
  });

  ngOnInit() {
    //this.myForm.reset();
    if(this.loginMode == "IN"){
      this.pageTitle = "Sign In"
      this.buttonLabel = "Sign In"
    }else if (this.loginMode == "UP"){
      this.pageTitle = "Sign UP!!"
      this.buttonLabel = "Register"
    }
  }

  submitBtn() {
    this.ds.doConsole('Home/LoginForm >> submitBtn()');
    var e = this.myForm.value.ownerEmail.trim();
    var p = "";
    // "PW" = Password Reset
    if(this.loginMode != "PW"){ 
      p = this.myForm.value.ownerPassword.trim();
    }
    let obj = {email: e,password: p};
    this.callSupabase(obj)
  };

  callSupabase(obj) {
    if (this.loginMode == 'IN') {
      this.supabase.signIn(obj);
    } else if(this.loginMode == 'UP'){
      this.supabase.signUp(obj);
    }else if(this.loginMode == 'PW'){
      this.supabase.resetPassword(obj.email);
    }
    //this.myForm.reset();
  }

  changePassword(){
    this.loginMode = "PW"
    this.pageTitle = "Reset Password"
    this.buttonLabel = "Submit"
  }

  public handleError = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  };

  constructor(
    private router: Router,
    private ds: DataService,
    private supabase: SupabaseService,
  ) {}
}

