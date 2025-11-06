import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const snap = await this.afs.doc(`users/${user.uid}`).get().toPromise();
    const role = (snap?.data() as any)?.role;

    if (role === 'nurse') {
      this.router.navigate(['/nurse/dashboard']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'employer') {
      this.router.navigate(['/patients/dashboard']);
    } else if (role === 'provider') {
      this.router.navigate(['/provider/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
    return false; // on bloque la route initiale et redirige
  }

  
}
