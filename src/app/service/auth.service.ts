import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

// 👉 (optionnel) si tu veux écrire lastLogin après auth
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  private userName = new BehaviorSubject<string | null>(null);
  userName$: Observable<string | null> = this.userName.asObservable();

  // ⚠️ ajoute AngularFirestore si tu veux appeler updateLastLogin()
  constructor(private fireAuth: AngularFireAuth, private router: Router, private afs: AngularFirestore) {}

  async signInAnonymously() {
    const cred = await this.fireAuth.signInAnonymously();
    return cred.user;
  }

  async getIdToken(forceRefresh = true): Promise<string | null> {
    const user = await this.fireAuth.currentUser;
    return user ? user.getIdToken(forceRefresh) : null;
  }

  // ✅ NOUVEAU: méthode “pure” qui retourne le UserCredential (utilisée par LoginComponent)
  async signInWithEmailAndPassword(email: string, password: string) {
    const cred = await this.fireAuth.signInWithEmailAndPassword(email, password);
    // état local
    this.loggedIn.next(true);
    localStorage.setItem('token', 'true');

    // username local
    const displayName = cred.user?.displayName || email.split('@')[0];
    this.userName.next(displayName);
    localStorage.setItem('userName', displayName);

    // (optionnel) trace le lastLogin dans users/{uid}
    if (cred.user?.uid) {
      await this.updateLastLogin(cred.user.uid);
    }

    return cred; // <-- important: on retourne le UserCredential
  }

  // Ta méthode existante (garde-la si d’autres écrans l’utilisent)
  // Elle navigue directement vers /home. Pour l’écran “rôles”, préfère la méthode ci-dessus.
  login(email: string, password: string) {
    this.fireAuth.signInWithEmailAndPassword(email, password).then(
      (userCredential) => {
        this.loggedIn.next(true);
        localStorage.setItem('token', 'true');

        const user = userCredential.user;
        if (user) {
          const displayName = user.displayName || email.split('@')[0];
          this.userName.next(displayName);
          localStorage.setItem('userName', displayName);
          // (optionnel) trace lastLogin
          this.updateLastLogin(user.uid);
        }

        // ⚠️ Cette navigation est “statique”. Pour la redirection par rôles,
        // utilise plutôt signInWithEmailAndPassword() depuis le LoginComponent.
        this.router.navigate(['/home', { username: 'JohnDoe' }]);
      },
      (err: any) => {
        alert(err.message);
        this.router.navigate(['/login']);
      }
    );
  }

  register(email: string, password: string, displayName: string) {
    this.fireAuth.createUserWithEmailAndPassword(email, password).then((userCredential) => {
      const user = userCredential.user;
      if (user) {
        user.updateProfile({ displayName }).then(() => {
          alert('Registration successful');
          this.userName.next(displayName);
          localStorage.setItem('userName', displayName);
          this.router.navigate(['/login']);
        });
      }
    }, (err: any) => {
      alert(err.message);
      this.router.navigate(['/register']);
    });
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  logout() {
    this.fireAuth.signOut().then(
      () => {
        this.loggedIn.next(false);
        this.userName.next(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        this.router.navigate(['/login']);
      },
      (err: any) => {
        alert(err.message);
      }
    );
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  // ✅ (optionnel) trace du dernier login
  private async updateLastLogin(uid: string) {
    try {
      await this.afs.doc(`users/${uid}`).set(
        { lastLogin: firebase.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.warn('lastLogin update skipped:', e);
    }
  }
}