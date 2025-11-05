import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  private userName = new BehaviorSubject<string | null>(null);
  userName$: Observable<string | null> = this.userName.asObservable();

  constructor(private fireAuth: AngularFireAuth, private router: Router, private afs: AngularFirestore) {}

  async signInAnonymously() {
    const cred = await this.fireAuth.signInAnonymously();
    return cred.user;
  }

  async getIdToken(forceRefresh = true): Promise<string | null> {
    const user = await this.fireAuth.currentUser;
    return user ? user.getIdToken(forceRefresh) : null;
  }

  /** Returns the Firebase UserCredential */
  async signInWithEmailAndPassword(email: string, password: string) {
    const cred = await this.fireAuth.signInWithEmailAndPassword(email, password);
    this.loggedIn.next(true);
    localStorage.setItem('token', 'true');

    const displayName = cred.user?.displayName || email.split('@')[0];
    this.userName.next(displayName);
    localStorage.setItem('userName', displayName);

    if (cred.user?.uid) {
      await this.updateLastLogin(cred.user.uid);
    }

    return cred;
  }

  /** Legacy method kept for compatibility */
  login(email: string, password: string) {
    this.fireAuth.signInWithEmailAndPassword(email, password).then(
      async (userCredential) => {
        this.loggedIn.next(true);
        localStorage.setItem('token', 'true');

        const user = userCredential.user;
        if (user) {
          const displayName = user.displayName || email.split('@')[0];
          this.userName.next(displayName);
          localStorage.setItem('userName', displayName);
          await this.updateLastLogin(user.uid);
        }

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
