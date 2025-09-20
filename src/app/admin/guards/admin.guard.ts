import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {}

  canActivate() {
    return this.afAuth.idTokenResult.pipe(
      map(res => {
        const roles = (res?.claims?.['roles'] as string[]) || [];
        const ok = roles.includes('admin');
        if (!ok) this.router.navigateByUrl('/login');
        return ok;
      })
    );
  }
}
