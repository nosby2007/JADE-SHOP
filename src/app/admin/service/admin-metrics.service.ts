import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import firebase from 'firebase/compat/app';

export interface AppUser {
  uid: string;
  email?: string;
  displayName?: string;
  roles?: string[];
  role?: string;          // mirror du 1er rôle
  providerId?: string;
  status?: 'active'|'suspended'|'invited'|string;
  disabled?: boolean;
  createdAt?: any;        // Timestamp
  updatedAt?: any;        // Timestamp
  lastLogin?: any;        // Timestamp
}

@Injectable({ providedIn: 'root' })
export class AdminMetricsService {
  private afs = inject(AngularFirestore);
  private afAuth = inject(AngularFireAuth);

  users$ = this.afs.collection<AppUser>('users').valueChanges({ idField: 'uid' });

  adminsCount$ = this.afs.collection('admins').valueChanges().pipe(map(docs => docs.length));
  usersCount$  = this.users$.pipe(map(u => u.length));

  disabledCount$ = this.users$.pipe(map(u => u.filter(x => !!x.disabled).length));

  // connexions sur 7 jours
  logins7d$ = this.users$.pipe(
    map(users => {
      const now = firebase.firestore.Timestamp.now().toDate().getTime();
      const dayMs = 24*3600*1000;
      const cutoff = now - 7*dayMs;
      return users.filter(u => {
        const t = (u.lastLogin?.toDate?.() ?? u.lastLogin) as Date | undefined;
        return t ? t.getTime() >= cutoff : false;
      }).length;
    })
  );

  // distribution rôles (pie)
  roleDist$ = this.users$.pipe(
    map(users => {
      const acc = new Map<string, number>();
      users.forEach(u => {
        const roles = u.roles?.length ? u.roles : (u.role ? [u.role] : ['user']);
        roles.forEach(r => acc.set(r, (acc.get(r) ?? 0) + 1));
      });
      return Array.from(acc.entries()).map(([name, value]) => ({ name, value }));
    })
  );

  // providers (bar)
  providerDist$ = this.users$.pipe(
    map(users => {
      const acc = new Map<string, number>();
      users.forEach(u => {
        const p = u.providerId || 'password'; // fallback
        acc.set(p, (acc.get(p) ?? 0) + 1);
      });
      const labels = Array.from(acc.keys());
      const values = labels.map(k => acc.get(k)!);
      return { labels, values };
    })
  );

  // connexions 14 jours (line)
  logins14dSeries$ = this.users$.pipe(
    map(users => {
      const today = new Date();
      const days: string[] = [];
      const series: number[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const key = d.toISOString().slice(0,10);
        days.push(key);
        const count = users.filter(u => {
          const t = (u.lastLogin?.toDate?.() ?? u.lastLogin) as Date | undefined;
          if (!t) return false;
          const key2 = new Date(t.getFullYear(), t.getMonth(), t.getDate()).toISOString().slice(0,10);
          return key2 === key;
        }).length;
        series.push(count);
      }
      return { days, series };
    })
  );

  // derniers users
  latestUsers$ = this.afs.collection<AppUser>('users', ref =>
    ref.orderBy('updatedAt', 'desc').limit(10)
  ).valueChanges({ idField: 'uid' });

  // erreurs récentes (si tu stockes dans appErrors ou logs/errors)
  errors$ = this.afs.collection<any>('appErrors', ref =>
    ref.orderBy('ts', 'desc').limit(10)
  ).valueChanges({ idField: 'id' });
}
