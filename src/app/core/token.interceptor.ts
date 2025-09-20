// src/app/core/interceptors/auth-token.interceptor.ts
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private afAuth = inject(AngularFireAuth);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith(environment.apiBase)) return next.handle(req);
  
    return this.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        if (!user) return next.handle(req);
        return from(user.getIdToken(true)).pipe(
          switchMap(token => {
            const clone = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
            return next.handle(clone);
          })
        );
      })
    );
  }

  
}
