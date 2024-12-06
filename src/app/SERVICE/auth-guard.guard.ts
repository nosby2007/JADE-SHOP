import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, CanLoad, CanMatch, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate {
  constructor(private auth: AuthService, private route:Router){
    
  }
  canActivate() {
    if(this.auth.isLoggedIn()){
      return true;
    }
    else{
      this.route.navigate(['login'])
      return false;
    }
    
  }
}
