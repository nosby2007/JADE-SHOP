import { Injectable } from '@angular/core';
import { CanActivate, Route, Router, UrlSegment } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {}

 canActivate() {
    return this.afAuth.idTokenResult.pipe(
      switchMap(res => {
        const claimRoles = (res?.claims?.['roles'] as string[]) || [];
        if (claimRoles.includes('admin')) return of(true);

        // Fallback to Firestore user doc
        const uid = res?.claims?.['user_id'];
        if (!uid) return of(false);
        return this.afs.doc(`users/${uid}`).valueChanges().pipe(
          map((doc: any) => Array.isArray(doc?.roles) && doc.roles.includes('admin'))
          
        );
      }),
      map(isAdmin => {
        if (!isAdmin) this.router.navigateByUrl('/login');
        return isAdmin;
      })
    );
  }
}
