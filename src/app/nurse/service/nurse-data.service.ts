// src/app/nurse/service/nurse-data.service.ts
import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { environment } from 'src/environments/environment';
import { Rx, NurseTask, Assessment, Patient } from '../models/patient.model';
import { stripUndefinedDeep, sanitizeRepeat, nextDate, toTs } from './utils';

@Injectable({ providedIn: 'root' })
export class NurseDataService {
  private afs = inject(AngularFirestore);
  private afAuth = inject(AngularFireAuth);
  private http = inject(HttpClient);
  private base = `${environment.apiBase || ''}`.trim();

  /** UID courant (null si non connecté) */
  private get currentUserUid(): string | null {
    return firebase.auth().currentUser?.uid || null;
  }

  /* ===================== Prescriptions ===================== */

  listRx(pid: string) {
    return this.afs
      .collection<Rx>(`patients/${pid}/prescriptions`, ref => ref.orderBy('createdAt', 'desc'))
      .valueChanges({ idField: 'id' });
  }

  /**
   * Ajoute une prescription :
   * - convertit startDate/endDate en Firestore Timestamp
   * - enlève signerEmail/signerPassword/attest du payload
   * - ajoute createdBy/createdAt/updatedAt
   * - TENTE l'API (avec Authorization Bearer) puis fallback Firestore
   */
  async addRx(pid: string, data: Partial<Rx> & any) {
    if (!pid) throw new Error('PatientId manquant');
    const uid = this.currentUserUid;
    if (!uid) throw new Error('Utilisateur non authentifié');

    const now = firebase.firestore.FieldValue.serverTimestamp();

    // 1) – extraire et nettoyer les champs UI-only
    const {
      signerEmail,      // UI only
      signerPassword,   // UI only
      attest,           // UI only
      startDate,
      endDate,
      eSignature,       // laissé si présent
      ...rest
    } = data || {};

    // 2) – forcer Timestamp pour start/end
    const startTs = startDate ? toTs(startDate) : null;
    const endTs   = endDate   ? toTs(endDate)   : null;

    // 3) – payload Firestore
    const fsPayload = stripUndefinedDeep({
      ...rest,
      patientId: pid,
      startDate: startTs,
      endDate: endTs,
      eSignature: eSignature || undefined, // { signerUid, signerEmail, signerName, signedAt, method }
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    });

    // 4) – payload API (JSON-safe) : pas de FieldValue.serverTimestamp dans un POST
    const apiPayload: any = {
      ...fsPayload,
      createdAt: null,
      updatedAt: null,
      startDate: startTs ? startTs.toMillis() : null,
      endDate: endTs ? endTs.toMillis() : null,
    };
    if (apiPayload.eSignature?.signedAt) {
      apiPayload.eSignature = { ...apiPayload.eSignature, signedAt: null };
    }

    // 5) – API d’abord (avec Bearer)
    if (this.base) {
      try {
        const idToken = await firstValueFrom(this.afAuth.idToken);
        const { id } = await firstValueFrom(
          this.http.post<{ id: string }>(
            `${this.base}/patients/${pid}/prescriptions`,
            apiPayload,
            { headers: { Authorization: `Bearer ${idToken}` } }
          )
        );
        return id;
      } catch (e) {
        console.warn('[addRx] API KO, fallback Firestore. Erreur=', e);
        // continue vers fallback Firestore
      }
    } else {
      console.log('[addRx] Pas d’API configurée, Firestore direct.');
    }

    // 6) – Firestore fallback
    try {
      const ref = await this.afs.collection(`patients/${pid}/prescriptions`).add(fsPayload);
      return ref.id;
    } catch (e) {
      console.error('[addRx] Firestore KO', e);
      throw e;
    }
  }

  /** (optionnel) Termine une prescription (endDate=now) */
  async endRx(pid: string, rxId: string) {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    await this.afs.doc(`patients/${pid}/prescriptions/${rxId}`).update({
      endDate: now,
      updatedAt: now,
    });
  }

  /* ======================== Tasks ========================== */

  listTasks(pid: string) {
    return this.afs
      .collection<NurseTask>(`patients/${pid}/tasks`, ref => ref.orderBy('dueAt', 'asc'))
      .valueChanges({ idField: 'id' });
  }

  async addTask(pid: string, data: Partial<NurseTask>) {
    if (!pid) throw new Error('PatientId manquant');
    const uid = this.currentUserUid;
    if (!uid) throw new Error('Utilisateur non authentifié');

    const now = firebase.firestore.FieldValue.serverTimestamp();
    const safeRepeat = sanitizeRepeat((data as any)?.repeat);

    const payload = stripUndefinedDeep({
      completed: false,
      ...data,
      repeat: safeRepeat,
      patientId: pid,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    });

    if (this.base) {
      try {
        const idToken = await firstValueFrom(this.afAuth.idToken);
        const { id } = await firstValueFrom(
          this.http.post<{ id: string }>(
            `${this.base}/patients/${pid}/tasks`,
            payload,
            { headers: { Authorization: `Bearer ${idToken}` } }
          )
        );
        return id;
      } catch (e) {
        console.warn('[addTask] API KO, fallback Firestore. Erreur=', e);
      }
    } else {
      console.log('[addTask] Pas d’API configurée, Firestore direct.');
    }

    try {
      const ref = await this.afs.collection(`patients/${pid}/tasks`).add(payload);
      return ref.id;
    } catch (e) {
      console.error('[addTask] Firestore KO', e);
      throw e;
    }
  }

  /* ====================== Assessments ====================== */

  listAssessments(pid: string) {
    return this.afs
      .collection<Assessment>(`patients/${pid}/assessments`, ref => ref.orderBy('createdAt', 'desc'))
      .valueChanges({ idField: 'id' });
  }

  async addAssessment(pid: string, data: Partial<Assessment>) {
    const uid = this.currentUserUid;
    if (!uid) throw new Error('Utilisateur non authentifié');

    const now = firebase.firestore.FieldValue.serverTimestamp();

    const payload = stripUndefinedDeep({
      status: 'open',
      ...data,
      patientId: pid,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    });

    if (this.base) {
      try {
        const idToken = await firstValueFrom(this.afAuth.idToken);
        const { id } = await firstValueFrom(
          this.http.post<{ id: string }>(
            `${this.base}/patients/${pid}/assessments`,
            payload,
            { headers: { Authorization: `Bearer ${idToken}` } }
          )
        );
        return id;
      } catch {
        // continue to fallback
      }
    }

    const ref = await this.afs.collection(`patients/${pid}/assessments`).add(payload);
    return ref.id;
  }

  /* ======================= Patients ======================== */

  getPatient(id: string): Observable<any> {
    return this.afs
      .doc(`patients/${id}`)
      .snapshotChanges()
      .pipe(map(s => (s.payload.exists ? { id: s.payload.id, ...(s.payload.data() as any) } : null)));
  }

  // --- GLOBAL ---
  listAllPatients(): Observable<Patient[]> {
    return this.afs.collection<Patient>('patients', ref => ref.orderBy('createdAt', 'desc'))
      .valueChanges({ idField: 'id' });
  }

  listAllTasks(): Observable<NurseTask[]> {
    return this.afs.collectionGroup<NurseTask>('tasks', ref => ref.orderBy('dueAt', 'asc'))
      .valueChanges({ idField: 'id' });
  }

  /**
   * Complète une occurrence et, si récurrente, crée la **prochaine**.
   */
  async completeTask(pid: string, tid: string, completed = true) {
    const docRef = this.afs.doc<NurseTask>(`patients/${pid}/tasks/${tid}`);
    const snap = await docRef.ref.get();
    if (!snap.exists) return;

    const cur = snap.data() as NurseTask;
    await docRef.update({
      completed,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Si pas récurrente → terminé
    if (!cur.repeat?.enabled) return;

    // Calcul de la prochaine date
    const every = cur.repeat.every || 1;
    const unit = cur.repeat.unit || 'day';
    const rule = { every, unit, byWeekday: cur.repeat.byWeekday };

    const curDate = (cur.dueAt?.toDate?.() as Date) || new Date();
    const candidates = nextDate(curDate, rule);
    const next = candidates.sort((a, b) => a.getTime() - b.getTime())[0];

    // Check bornes (count/until)
    let ok = true;

    if (cur.repeat.count !== undefined) {
      const nextIndex = (cur.occurrenceIndex ?? 0) + 1;
      if (nextIndex >= cur.repeat.count) ok = false;
    }
    if (ok && cur.repeat.until) {
      const until = (cur.repeat.until.toDate?.() as Date) || cur.repeat.until;
      if (next > until) ok = false;
    }

    if (!ok) return;

    await this.afs.collection(`patients/${pid}/tasks`).add(stripUndefinedDeep({
      patientId: pid,
      title: cur.title,
      notes: cur.notes || '',
      dueAt: toTs(next),
      completed: false,
      repeat: cur.repeat,
      parentTaskId: cur.parentTaskId || (cur as any).id || tid,
      occurrenceIndex: (cur.occurrenceIndex ?? 0) + 1,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
  }
}
