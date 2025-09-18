// src/app/SERVICE/wound-assessment.service.ts
import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { environment } from 'src/environments/environment';
import { WoundAssessment } from '../models/wound-assessment.model';

@Injectable({ providedIn: 'root' })
export class WoundAssessmentService {
  private afs = inject(AngularFirestore);
  private http = inject(HttpClient);
  private base = environment.apiBase; // ex: https://us-central1-.../api

  /** -------- READS: Firestore (live) -------- */
  list(patientId: string) {
    return this.afs
      .collection<WoundAssessment>(
        `patients/${patientId}/woundAssessments`,
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
      .doc<WoundAssessment>(`patients/${patientId}/woundAssessments/${assessmentId}`)
      .valueChanges();
  }

  /** -------- WRITES: API first, Firestore fallback -------- */

  /** Crée une évaluation. Retourne l'id créé. */
  async create(patientId: string, data: WoundAssessment): Promise<string> {
    const clean = this.stripUndefined(data);
    // 1) Tente via API (crée et renvoie { id })
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string }>(`${this.base}/wounds`, { patientId, data: clean })
      );
      return res.id;
    } catch (e) {
      // 2) Fallback Firestore direct
      const createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const ref = await this.afs
        .collection(`patients/${patientId}/woundAssessments`)
        .add({ ...clean, createdAt });
      return ref.id;
    }
  }

  /** Met à jour partiellement une évaluation */
  async update(
    patientId: string,
    assessmentId: string,
    patch: Partial<WoundAssessment>
  ): Promise<void> {
    const clean = this.stripUndefined(patch);
    // 1) API
    try {
      await firstValueFrom(
        this.http.patch<{ ok: true }>(
          `${this.base}/wounds/${patientId}/${assessmentId}`,
          clean
        )
      );
      return;
    } catch (e) {
      // 2) Fallback Firestore
      await this.afs
        .doc(`patients/${patientId}/woundAssessments/${assessmentId}`)
        .update(clean as any);
    }
  }

  /** Supprime une évaluation */
  async remove(patientId: string, assessmentId: string): Promise<void> {
    // 1) API
    try {
      await firstValueFrom(
        this.http.delete<{ ok: true }>(`${this.base}/wounds/${patientId}/${assessmentId}`)
      );
      return;
    } catch (e) {
      // 2) Fallback Firestore
      await this.afs
        .doc(`patients/${patientId}/woundAssessments/${assessmentId}`)
        .delete();
    }
  }

  /** -------- Utils -------- */
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
