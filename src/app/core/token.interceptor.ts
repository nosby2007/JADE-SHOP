// src/app/core/interceptors/auth-token.interceptor.ts
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private afAuth = inject(AngularFireAuth);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne touche qu’à l’API backend
    if (!req.url.startsWith(environment.apiBase)) {
      return next.handle(req);
    }

    // 1) Attendre l'utilisateur (évite l’émission null de idToken au démarrage)
    return this.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          console.warn('[AuthInterceptor] Pas de user → envoi sans Authorization', req.url);
          return next.handle(req);
        }
        // 2) Récupérer le token du user
        return from(user.getIdToken(/* forceRefresh */ true)).pipe(
          switchMap(token => {
            if (!token) {
              console.warn('[AuthInterceptor] token null → envoi sans Authorization', req.url);
              return next.handle(req);
            }
            const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
            // DEBUG
            // console.log('[AuthInterceptor] header ajouté', cloned.url);
            return next.handle(cloned);
          })
        );
      })
    );
  }
}
