import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleRedirectGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const user = await this.afAuth.currentUser;
    if (!user) {
      return this.router.createUrlTree(['/login']);
    }

    const snap = await firstValueFrom(this.afs.doc(`users/${user.uid}`).valueChanges());
    const data = (snap as any) || {};
    const role: string | undefined = data?.role;
    const roles: string[] = Array.isArray(data?.roles) ? data.roles : (role ? [role] : []);

    if (roles.includes('nurse'))  return this.router.createUrlTree(['/nurse/dashboard']);
    if (roles.includes('admin'))  return this.router.createUrlTree(['/admin/dashboard']);
    if (roles.includes('employer')) return this.router.createUrlTree(['/employer']);
    if (roles.includes('user'))   return this.router.createUrlTree(['/patient/dashboard']);
    if (roles.includes('provider')) return this.router.createUrlTree(['/provider/dashboard']);


    // fallback
    return this.router.createUrlTree(['/home']);
  }
}
