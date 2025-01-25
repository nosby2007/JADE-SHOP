import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent {
  email: string = '';
  password: string = '';
  error: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<AuthModalComponent>,
    private auth: AngularFireAuth
  ) {}

  authenticate(): void {
    this.auth.signInWithEmailAndPassword(this.email, this.password)
      .then(() => {
        this.dialogRef.close(true); // Renvoie "true" si l'authentification réussit
      })
      .catch((err) => {
        this.error = 'Authentification échouée. Vérifiez vos informations.';
        console.error(err);
      });
  }

  cancel(): void {
    this.dialogRef.close(false); // Renvoie "false" si l'utilisateur annule
  }
}
