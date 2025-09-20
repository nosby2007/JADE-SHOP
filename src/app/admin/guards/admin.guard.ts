import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {}

  canActivate() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) return of(false);
        return this.afs.doc(`admins/${user.uid}`).get().pipe(
          map(snap => {
            const ok = snap.exists;
            if (!ok) this.router.navigateByUrl('/'); // redirige si non admin
            return ok;
          })
        );
      })
    );
  }
}
