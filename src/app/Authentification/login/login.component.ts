import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/SERVICE/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email : string = '';
  password: string = '';
  constructor(private auth:AuthService) { }

  ngOnInit(): void {
  }
  login(){
    if(this.email== ''){
      alert('veuillez entrer votre email');
    return;
    }
    
     if(this.password== ''){
      alert('veuillez entrer votre mot de pass');
    return;
     }
    this.auth.login(this.email, this.password);

    this.email= '';
    this.password='';
    
  }


}
