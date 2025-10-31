import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { AuthService } from 'src/app/service/auth.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';

  loading = false;
  errorMsg: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private afs: AngularFirestore
  ) {}

  ngOnInit(): void {}

  async login() {
    this.errorMsg = null;

    if (!this.email?.trim()) {
      this.errorMsg = 'Veuillez entrer votre email.';
      return;
    }
    if (!this.password?.trim()) {
      this.errorMsg = 'Veuillez entrer votre mot de passe.';
      return;
    }

    this.loading = true;
    try {
      // ⚠️ Assure-toi que AuthService expose bien cette méthode et qu’elle retourne un UserCredential (Firebase)
      const cred = await this.auth.signInWithEmailAndPassword(this.email, this.password);
      if (!cred?.user?.uid) throw new Error('Utilisateur introuvable après connexion');

      // Récupère le profil pour lire les rôles
      const doc = await firstValueFrom(this.afs.doc(`users/${cred.user.uid}`).valueChanges());
      const roles: string[] =
        (doc as any)?.roles || ((doc as any)?.role ? [(doc as any).role] : []);

      // Redirection selon rôle
      if (roles.includes('admin')) {
        await this.router.navigateByUrl('/admin');
      } else if (roles.includes('employer')) {
        await this.router.navigateByUrl('/employer');
      } else if (roles.includes('nurse')) {
        await this.router.navigateByUrl('/nurse');
      } else if (roles.includes('user')) {
        await this.router.navigateByUrl('/home');
      } else {
        this.router.navigate(['/login']); // fallback
      }

      // Met à jour la dernière connexion
      await this.afs.doc(`users/${cred.user.uid}`).set({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Optionnel: nettoyer le formulaire
      this.email = '';
      this.password = '';
    } catch (err: any) {
      console.error('Login error:', err);
      // Message utilisateur simplifié (tu peux mapper les codes Firebase si tu veux)
      this.errorMsg = err?.message || 'Connexion impossible. Vérifiez vos identifiants.';
    } finally {
      this.loading = false;
    }
  }
}
