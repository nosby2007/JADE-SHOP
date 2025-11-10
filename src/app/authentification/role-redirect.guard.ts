// src/app/authentification/role-redirect.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({ providedIn: 'root' })
export class RoleRedirectGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const user = await this.afAuth.currentUser;
    if (!user) {
      return this.router.parseUrl('/login');
    }

    // force fresh claims
    const token = await user.getIdTokenResult(true);
    const roles: string[] = Array.isArray((token.claims as any).roles) ? (token.claims as any).roles : [];
    const primary = roles[0] || (token.claims as any).role || 'user';

    // map role → target url
    const target = this.targetForRole(primary);

    // if already under the right area, allow
    if (this.isAlreadyUnderArea(state.url, target)) {
      return true;
    }

    // otherwise, redirect
    return this.router.parseUrl(target);
  }

  private targetForRole(role: string): string {
    switch (role) {
      case 'nurse':    return '/nurse/dashboard';
      case 'admin':    return '/admin/dashboard';
      case 'employer': return '/patients/dashboard';
      case 'provider': return '/provider/dashboard';
      default:         return '/home';
    }
  }

  private isAlreadyUnderArea(currentUrl: string, target: string): boolean {
    // e.g. current “/patients/…” and target “/patients/dashboard”
    const currentRoot = '/' + currentUrl.split('/').filter(Boolean)[0];     // "/patients"
    const targetRoot  = '/' + target.split('/').filter(Boolean)[0];         // "/patients"
    return currentRoot === targetRoot;
  }
}
