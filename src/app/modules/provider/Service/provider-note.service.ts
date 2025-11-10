import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ProviderNote } from 'src/app/models/global.model';


@Injectable({ providedIn: 'root' })
export class ProviderNoteService {
  private afs = inject(AngularFirestore);
  private auth = inject(AngularFireAuth);

  list(patientId: string): Observable<ProviderNote[]> {
    return this.afs
      .collection<ProviderNote>(`patients/${patientId}/providerNotes`, ref =>
        ref.orderBy('effectiveAt', 'desc').limit(200)
      )
      .snapshotChanges()
      .pipe(
        map(snaps =>
          snaps.map(s => ({ id: s.payload.doc.id, ...(s.payload.doc.data() as any) }))
        )
      );
  }

 async create(patientId: string, data: Partial<ProviderNote>): Promise<string> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const now = firebase.firestore.FieldValue.serverTimestamp();

    const payload: Partial<ProviderNote> & {
      patientId: string;
      createdBy: string;
      createdAt: any;
      updatedAt: any;
    } = {
      ...data,
      patientId,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await this.afs
      .collection(`patients/${patientId}/providerNotes`)
      .add(payload as any);

    return ref.id;
  }

  async update(patientId: string, id: string, patch: Partial<ProviderNote>) {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    await this.afs
      .doc(`patients/${patientId}/providerNotes/${id}`)
      .set({ ...patch, updatedAt: now } as any, { merge: true });
  }

  async remove(patientId: string, id: string) {
    await this.afs.doc(`patients/${patientId}/providerNotes/${id}`).delete();
  }
}
