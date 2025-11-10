import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { LabReport } from 'src/app/models/global.model'; // ✅ use your shared model

@Injectable({ providedIn: 'root' })
export class LabService {
  private afs = inject(AngularFirestore);
  private auth = inject(AngularFireAuth);
  private storage = inject(AngularFireStorage);

  /** 🔹 List all labs */
  list(patientId: string): Observable<LabReport[]> {
    return this.afs
      .collection<LabReport>(`patients/${patientId}/labs`, ref =>
        ref.orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map(snaps =>
          snaps.map(s => ({
            id: s.payload.doc.id,
            ...(s.payload.doc.data() as LabReport),
          }))
        )
      );
  }

  /** 🔹 Create a lab report */
  async create(patientId: string, data: Partial<LabReport>): Promise<string> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const now = firebase.firestore.FieldValue.serverTimestamp();
  const payload: Partial<LabReport> = {
  patientId,
  reportName: data.reportName || '',
  orderingProvider: data.orderingProvider || '',
  reportingLab: data.reportingLab || '',
  flag: data.flag || 'Unknown',
  status: data.status || 'New',
  results: data.results || [],
  createdBy: user.uid,
  createdAt: now,
  updatedAt: now,
} as LabReport;

    const ref = await this.afs.collection(`patients/${patientId}/labs`).add(payload);
    return ref.id;
  }

  /** 🔹 Update */
  async update(patientId: string, labId: string, changes: Partial<LabReport>) {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    await this.afs.doc(`patients/${patientId}/labs/${labId}`).set(
      { ...changes, updatedAt: now },
      { merge: true },
      
    );
    
  }

  /** 🔹 Remove */
  async remove(patientId: string, labId: string) {
    await this.afs.doc(`patients/${patientId}/labs/${labId}`).delete();
  }

  /** 🔹 Upload attachment */
  async uploadAttachment(patientId: string, file: File) {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const name = `${Date.now()}_${file.name.replace(/[^\w.\-]+/g, '_')}`;
    const path = `patients/${patientId}/labs/attachments/${name}`;
    const upload = await this.storage.upload(path, file, {
      customMetadata: { uploadedBy: user.uid },
    });
    const url = await upload.ref.getDownloadURL();
    return { url, path, name };
  }

  /** 🔹 Attach file to lab */
  async addAttachment(patientId: string, labId: string, fileInfo: { url: string; name: string; path: string }) {
    await this.afs.doc(`patients/${patientId}/labs/${labId}`).update({
      attachments: firebase.firestore.FieldValue.arrayUnion(fileInfo),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
  removeAttachment(patientId: string, labId: string, fileInfo: { url: string; name: string; path: string }) {
    return this.afs.doc(`patients/${patientId}/labs/${labId}`).update({
      attachments: firebase.firestore.FieldValue.arrayRemove(fileInfo),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } 
}
