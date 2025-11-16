// document.service.ts
import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, firstValueFrom, Observable } from 'rxjs';

// -----------------------------
// Types
// -----------------------------
export type StaffRole = 'admin' | 'employee' | 'nurse' | 'provider';
export type PatientDocType =
  | 'dischargeSummary'
  | 'assessment'
  | 'treatmentPlan'
  | 'consent'
  | 'labResult'
  | 'rx'
  | 'billing'
  | 'other'
  | string; // allow custom tags

export interface UploadOptions {
  type?: PatientDocType;
  description?: string;
  /**
   * who can see this document (enforced by Firestore rules)
   * - careTeam        : default for staff uploads
   * - patientAndTeam  : patient + assigned team
   * - private         : only uploader/admin
   */
  visibility?: 'careTeam' | 'patientAndTeam' | 'private';
  /** any additional metadata to persist on the Firestore doc */
  extra?: Record<string, unknown>;
}

interface UploadedBy {
  uid: string;
  role?: string;
  email?: string | null;
}

interface UserProfile {
  role?: string;
  email?: string | null;
  displayName?: string | null;
}

interface DocumentRecord {
  id?: string;
  fileId: string;
  name: string;
  size: number;
  mimeType: string | null;
  type: string | null;
  description: string;
  url: string;
  path: string;
  patientId: string;
  visibility: 'careTeam' | 'patientAndTeam' | 'private';
  uploadedBy: UploadedBy;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
}

// -----------------------------

@Injectable({ providedIn: 'root' })
export class PatientDocumentService {
  private readonly storage = inject(AngularFireStorage);

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  // -----------------------------
  // Helpers
  // -----------------------------
  private async currentUserOrThrow() {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return user;
  }

  private uuid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as any).randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private async getCurrentUserRole(): Promise<StaffRole | 'user' | undefined> {
    const me = await this.currentUserOrThrow();

    // Prefer custom claims
    const token = await me.getIdTokenResult();
    const claimRole = token.claims['role'] as StaffRole | undefined;
    if (claimRole) return claimRole;

    // Fallback to users/{uid}
    const snap = await firstValueFrom(
      this.firestore.doc<UserProfile>(`users/${me.uid}`).get()
    );
    const doc = snap.data();
    return (doc?.role as StaffRole | 'user' | undefined) ?? 'user';
  }

  private buildStoragePath(patientId: string, fileId: string, fileName: string) {
    const safeName = fileName.replace(/[^\w.\-() ]+/g, '_');
    return `patients/${patientId}/documents/${fileId}/${safeName}`;
  }

  private async assertPatientExists(patientId: string): Promise<void> {
    const ref = this.firestore.doc(`patients/${patientId}`);
    const snap = await firstValueFrom(ref.get());
    if (!snap.exists) {
      // Fail fast – we only ever store docs under existing patients
      throw new Error(`Patient ${patientId} does not exist`);
    }
  }

  // -----------------------------
  // Core: upload to PATIENT documents
  // -----------------------------
  async uploadForPatient(
    patientId: string,
    files: File[],
    opts: UploadOptions
  ): Promise<void> {
    if (!patientId) throw new Error('Missing patientId');
    await this.assertPatientExists(patientId);

    const me = await this.currentUserOrThrow();
    const role = await this.getCurrentUserRole();

    for (const file of files) {
      const fileId = this.uuid();
      const path = this.buildStoragePath(patientId, fileId, file.name);
      const ref = this.storage.ref(path);

      const task = this.storage.upload(path, file, {
        customMetadata: {
          patientId,
          uploadedBy: me.uid,
          role: role || 'user',
          type: String(opts.type ?? ''),
        },
      });

      await new Promise<void>((resolve, reject) => {
        task.snapshotChanges().pipe(
          finalize(async () => {
            try {
              const url = await firstValueFrom(ref.getDownloadURL());

              const uploadedBy: UploadedBy = {
                uid: me.uid,
                role: role || 'user',
                email: me.email ?? null,
              };

              const doc: DocumentRecord = {
                fileId,
                name: file.name,
                size: file.size,
                mimeType: file.type || null,
                type: opts.type ?? null,
                description: opts.description ?? '',
                url,
                path,
                patientId,
                visibility: opts.visibility ?? 'careTeam',
                uploadedBy,
                createdAt: new Date(),
                ...(opts.extra ?? {}),
              };

              await this.firestore
                .collection<DocumentRecord>(`patients/${patientId}/documents`)
                .add(doc);

              resolve();
            } catch (e) {
              reject(e);
            }
          })
        ).subscribe({ error: reject });
      });
    }
  }

  // Optional helper: allow a logged-in patient to upload to their own chart
  async uploadAsCurrentPatient(files: File[], opts: UploadOptions): Promise<void> {
    const me = await this.currentUserOrThrow();
    await this.assertPatientExists(me.uid);
    return this.uploadForPatient(me.uid, files, {
      ...opts,
      visibility: opts.visibility ?? 'patientAndTeam',
    });
  }

  // -----------------------------
  // Reads & deletes
  // -----------------------------
  getPatientDocuments(patientId: string): Observable<DocumentRecord[]> {
    return this.firestore
      .collection<DocumentRecord>(`patients/${patientId}/documents`, ref =>
        ref.orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' });
  }

  async deletePatientDocument(
    patientId: string,
    docId: string,
    storagePath: string
  ): Promise<void> {
    await firstValueFrom(this.storage.ref(storagePath).delete());
    await this.firestore.doc(`patients/${patientId}/documents/${docId}`).delete();
  }
}
