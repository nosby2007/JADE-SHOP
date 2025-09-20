// src/app/SERVICE/wound-assessment.service.ts
import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { environment } from 'src/environments/environment';
import { WoundAssessment } from '../models/wound-assessment.model';

type WoundAssessmentCreate = Partial<WoundAssessment>;
type WoundAssessmentPatch  = Partial<WoundAssessment>;
type WoundAssessmentView = WoundAssessment & {
  id?: string;
  photoURL?: string;
  createdAt?: any;
  assessedAt?: any;
  updatedAt?: any;
};
@Injectable({ providedIn: 'root' })
export class WoundAssessmentService {
  private afs  = inject(AngularFirestore);
  private http = inject(HttpClient);
  private base = environment.apiBase; // ex: https://us-central1-.../api

  constructor(private afAuth: AngularFireAuth, private storage: AngularFireStorage,) {}

  item$!: Observable<WoundAssessmentView | undefined>;

  
  // ✅ upload d’une photo et retour de l’URL publique
  async uploadPhoto(patientId: string, file: File): Promise<string> {
    const safeName = file.name.replace(/\s+/g, '_');
    const path = `patients/${patientId}/wounds/${Date.now()}_${safeName}`;
    const task = await this.storage.upload(path, file);
    return await task.ref.getDownloadURL();
  }
  /* ---------------- READS (live) ---------------- */

  list(patientId: string) {
    return this.afs
      .collection<WoundAssessment>(
        `patients/${patientId}/woundAssessments`,   // ✅ chemin corrigé
        ref => ref.orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map(snaps =>
          snaps.map(s => ({
            id: s.payload.doc.id,
            ...(s.payload.doc.data() as any),
          }))
        )
      );
  }
  
  get(patientId: string, assessmentId: string) {
    return this.afs
      .doc<WoundAssessment>(`patients/${patientId}/woundAssessments/${assessmentId}`) // ✅
      .valueChanges();
  }
  
  async createMedia(patientId: string, data: any) {
    return this.afs.collection(`patients/${patientId}/media`).add(data);
  }
  
  async create(patientId: string, data: WoundAssessmentCreate): Promise<string> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Not authenticated');
  
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const clean = this.stripUndefined<WoundAssessmentCreate>(data);
  
    const payload = {
      ...clean,
      patientId,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
      assessedAt: (clean as any)?.assessedAt ?? now,
    };
  
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string }>(`${this.base}/woundAssessments`, { patientId, data: payload })
      );
      return res.id;
    } catch {
      const ref = await this.afs.collection(`patients/${patientId}/woundAssessments`).add(payload); // ✅
      return ref.id;
    }
  }
  
  async update(patientId: string, assessmentId: string, patch: WoundAssessmentPatch): Promise<void> {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const clean = this.stripUndefined<WoundAssessmentPatch>(patch);
  
    try {
      await firstValueFrom(
        this.http.patch<{ ok: true }>(
          `${this.base}/woundAssessments/${patientId}/${assessmentId}`,
          { ...clean, updatedAt: now }
        )
      );
    } catch {
      await this.afs
        .doc(`patients/${patientId}/woundAssessments/${assessmentId}`) // ✅
        .set({ ...clean, updatedAt: now } as any, { merge: true });
    }
  }
  

  /* -------------- WRITES: API-first / FS fallback -------------- */

 

  /** Supprime un assessment */
  async remove(patientId: string, assessmentId: string): Promise<void> {
    // 1) API
    try {
      await firstValueFrom(
        this.http.delete<{ ok: true }>(`${this.base}/assessments/${patientId}/${assessmentId}`)
      );
      return;
    } catch {
      // 2) Fallback Firestore
      await this.afs.doc(`patients/${patientId}/assessments/${assessmentId}`).delete();
    }
  }

  /* -------------- (Optionnel) Wounds CRUD si tu en as besoin -------------- */

  /** Crée une *wound* sous patients/{patientId}/wounds (règles déjà couvertes) */
  async createWound(patientId: string, data: any): Promise<string> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const now   = firebase.firestore.FieldValue.serverTimestamp();
    const clean = this.stripUndefined<any>(data);

    const payload = {
      ...clean,
      patientId,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string }>(`${this.base}/wounds`, { patientId, data: payload })
      );
      return res.id;
    } catch {
      const ref = await this.afs.collection(`patients/${patientId}/wounds`).add(payload);
      return ref.id;
    }
  }

  /* ---------------- Utils ---------------- */

  /** supprime récursivement les `undefined` (Firestore n’en veut pas) */
  private stripUndefined<T>(val: T): T {
    return this._strip(val) as T;
  }
  private _strip(val: unknown): unknown {
    if (Array.isArray(val)) {
      return (val as unknown[]).map(v => this._strip(v));
    }
    if (val && typeof val === 'object') {
      const anyVal = val as Record<string, unknown>;
      // préserve Firestore Timestamps/FieldValues
      if (typeof (anyVal as any).toDate === 'function' || typeof (anyVal as any).isEqual === 'function') {
        return val;
      }
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(anyVal)) {
        if (v !== undefined) out[k] = this._strip(v);
      }
      return out;
    }
    return val;
  }
}
