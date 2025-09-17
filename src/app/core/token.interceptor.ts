import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { from, Observable, switchMap, take } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private afAuth: AngularFireAuth) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return from(this.afAuth.idToken.pipe(take(1)).toPromise()).pipe(
      switchMap(token => {
        const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers;
        return next.handle(req.clone({ headers }));
      })
    );
  }
}
