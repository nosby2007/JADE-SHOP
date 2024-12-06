import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/SERVICE/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private auth:AuthService){}
  username: string = '';
  email: string = '';
  password: string = '';

  ngOnInit(): void {
  }
  register() {
    if(this.email ==''){
     alert('entrez votre email');
     
     
     return;
    }
    console.log(this.email);
    if(this.password==''){
     alert('entrez votre mot de pass')
     return;
    }
    console.log(this.password);
 
    this.auth.register(this.email, this.password);

    this.email= '';
    this.password='';
   }

}
