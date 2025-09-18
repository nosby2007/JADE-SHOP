import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/SERVICE/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
//import firebase from 'firebase/compat/app';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email : string = '';
  password: string = '';
  /*private afAuth = inject(AngularFireAuth);
  private http = inject(HttpClient);
  userUid: string | null = null;
  lastToken: string | null = null;
  apiResult: any;*/
  constructor(private auth:AuthService, private router:Router) { }

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
  /*async loginAnon() {
    const cred = await this.afAuth.signInAnonymously();
    console.log('Anon user:', cred.user?.uid);
    console.log('idToken:', await cred.user?.getIdToken(true));
  }

  async loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await this.afAuth.signInWithPopup(provider);
    console.log('Google user:', cred.user?.uid);
    console.log('idToken:', await cred.user?.getIdToken(true));
  }

  callApi() {
    const patientId = 'SOME_PATIENT_ID';
    this.http.get(`${environment.apiBase}/wounds/${patientId}`).subscribe({
      next: (r) => console.log('API OK', r),
      error: (e) => console.error('API ERR', e)
    });
  }


  // Ex. dans ton LoginComponent de debug*/
/*createAssessment() {
  const patientId = 'K3tWW91rDkqnciVk2Yry';
  const data = {
    describe: {
      type: 'Pressure',
      location: 'Heel',
      acquired: 'In-House Acquired',
      ageCategory: 'New'
    }
  };
  this.http.post(`${environment.apiBase}/wounds`, { patientId, data })
    .subscribe({
      next: (r) => {
        console.log('Created', r);
        // Recharge la liste
        this.http.get(`${environment.apiBase}/wounds/${patientId}`)
          .subscribe(x => console.log('List after create:', x));
      },
      error: (e) => console.error('Create ERR', e),
    });
}*/


}
