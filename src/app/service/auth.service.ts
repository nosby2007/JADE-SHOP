// src/app/core/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable, from, of, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, take } from 'rxjs/operators';

type Claims = { roles?: string[]; [k: string]: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ---- public reactive state
  user$ = this.afAuth.authState.pipe(shareReplay(1));
  idTokenResult$ = this.user$.pipe(
    switchMap(u => u ? from(u.getIdTokenResult(true)) : of(null)),
    shareReplay(1)
  );
  claims$ = this.idTokenResult$.pipe(
    map(r => (r?.claims as Claims) || {}),
    shareReplay(1)
  );
  roles$ = this.claims$.pipe(
    map(c => c.roles ?? []),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    shareReplay(1)
  );

  // Emits true once we have *some* idTokenResult (means “safe to read rules that depend on roles”)
  ready$ = this.idTokenResult$.pipe(map(r => !!r), shareReplay(1));

  // Legacy flags you use elsewhere
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  private userName = new BehaviorSubject<string | null>(localStorage.getItem('userName'));
  userName$: Observable<string | null> = this.userName.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private afs: AngularFirestore
  ) {}

  // ---- utilities
  async ensureFreshToken(): Promise<void> {
    const u = firebase.auth().currentUser;
    if (u) await u.getIdToken(true);
  }

  /** Wait until the given role appears in ID token claims (with timeout). */
  async waitForRole(role: string, timeoutMs = 6000, intervalMs = 300): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const u = firebase.auth().currentUser;
      if (!u) break;
      const tok = await u.getIdTokenResult(true);
      const roles = (tok?.claims as Claims)?.roles || [];
      if (roles.includes(role)) return true;
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  }

  hasRole(role: string): Observable<boolean> {
    return this.roles$.pipe(map(roles => roles.includes(role)));
  }

  // ---- auth flows
  async signInWithEmailAndPassword(email: string, password: string) {
    const cred = await this.afAuth.signInWithEmailAndPassword(email, password);

    // Force fresh claims immediately after sign-in
    await this.ensureFreshToken();

    // Optional: wait for a specific role that your rules require (e.g., employer)
    await this.waitForRole('employer'); // adjust or remove if not needed

    // UX flags
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
    this.afAuth.signInWithEmailAndPassword(email, password).then(
      async (userCredential) => {
        await this.ensureFreshToken();
        await this.waitForRole('employer');

        this.loggedIn.next(true);
        localStorage.setItem('token', 'true');

        const user = userCredential.user;
        if (user) {
          const displayName = user.displayName || email.split('@')[0];
          this.userName.next(displayName);
          localStorage.setItem('userName', displayName);
          await this.updateLastLogin(user.uid);
        }

        this.router.navigate(['/home', { username: 'JohnDoe' }]); // adjust route if needed
      },
      (err) => {
        alert(err.message);
        this.router.navigate(['/login']);
      }
    );
  }

  async getIdToken(forceRefresh = true): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.getIdToken(forceRefresh) : null;
  }

  register(email: string, password: string, displayName: string) {
    this.afAuth.createUserWithEmailAndPassword(email, password).then(async (uc) => {
      if (uc.user) {
        await uc.user.updateProfile({ displayName });
        await this.ensureFreshToken();
        alert('Registration successful');
        this.userName.next(displayName);
        localStorage.setItem('userName', displayName);
        this.router.navigate(['/login']);
      }
    }, (err) => {
      alert(err.message);
      this.router.navigate(['/register']);
    });
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  logout() {
    this.afAuth.signOut().then(
      () => {
        this.loggedIn.next(false);
        this.userName.next(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        this.router.navigate(['/login']);
      },
      (err) => alert(err.message)
    );
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
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
