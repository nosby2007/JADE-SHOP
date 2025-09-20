import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable } from 'rxjs';

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  role?: string;
  roles?: string[];
  phoneNumber?: string;
  photoURL?: string;
  status?: 'active'|'inactive';
  createdAt?: any; updatedAt?: any; lastLogin?: any; disabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  constructor(private afs: AngularFirestore, private fns: AngularFireFunctions) {}

  listUsers(): Observable<AppUser[]> {
    return this.afs.collection<AppUser>('users', ref => ref.orderBy('createdAt','desc')).valueChanges({ idField: 'uid' });
  }

  async createUser(input: { email: string; password: string; displayName?: string; role?: string; phoneNumber?: string; photoURL?: string }) {
    const callable = this.fns.httpsCallable('adminCreateUser');
    return await callable(input).toPromise();
  }

  async setRoles(uid: string, roles: string[]) {
    const callable = this.fns.httpsCallable('setUserRoles');
    return await callable({ uid, roles }).toPromise();
  }
}
