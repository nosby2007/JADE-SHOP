// src/app/nurse/service/nurse-data.service.ts  (excerpt – prescriptions part UPDATED)
import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { environment } from 'src/environments/environment';
import { Rx, NurseTask, Assessment, Patient } from '../models/patient.model';
import { stripUndefinedDeep, sanitizeRepeat, nextDate, toTs, asDate } from './utils';

@Injectable({ providedIn: 'root' })
export class NurseDataService {
  private afs = inject(AngularFirestore);
  private afAuth = inject(AngularFireAuth);
  private http = inject(HttpClient);
  private base = `${environment.apiBase}`;

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
   * - convertit startDate/endDate en Firestore Timestamp (compat)
   * - enlève signerEmail/signerPassword/attest du payload
   * - ajoute createdBy/createdAt/updatedAt
   * - API d’abord (JSON-safe), fallback Firestore
   */
  async addRx(pid: string, data: Partial<Rx> & any, ) {
    const now = firebase.firestore.FieldValue.serverTimestamp();

    // 1) – extraire et nettoyer les champs UI-only
    const {
      signerEmail,      // UI only
      signerPassword,   // UI only
      attest,           // UI only
      startDate,
      endDate,
      eSignature,       // laissé si présent (vient du composant après re-auth)
      ...rest
    } = data || {};

    // 2) – forcer Timestamp pour start/end
    const startTs = startDate ? toTs(startDate) : null; // utils/toTs -> compat Timestamp
    const endTs   = endDate   ? toTs(endDate)   : null;

    // 3) – payload Firestore
    const fsPayload = stripUndefinedDeep({
      ...rest,
      patientId: pid,
      startDate: startTs,
      endDate: endTs,
      eSignature: eSignature || undefined, // { signerUid, signerEmail, signerName, signedAt: serverTimestamp(), method }
      createdBy: this.currentUserUid,
      createdAt: now,
      updatedAt: now,
    });

    // 4) – payload API (JSON-safe) : pas de FieldValue.serverTimestamp dans un POST
    const apiPayload: any = {
      ...fsPayload,
      // Laissez le backend tamponner ces valeurs :
      createdAt: null,
      updatedAt: null,
    };
    // convertir Timestamps en millisecondes (ou ISO, selon votre API)
    apiPayload.startDate = startTs ? startTs.toMillis() : null;
    apiPayload.endDate   = endTs   ? endTs.toMillis()   : null;
    if (apiPayload.eSignature?.signedAt) {
      apiPayload.eSignature = { ...apiPayload.eSignature, signedAt: null };
    }

    // 5) – API d’abord
    const hasApi = !!(this.base && this.base.trim());
    if (hasApi) {
      try {
        const { id } = await firstValueFrom(
          this.http.post<{ id: string }>(`${this.base}/patients/${pid}/prescriptions`, apiPayload)
        );
        return id;
      } catch (e) {
        console.warn('[addRx] API KO, fallback Firestore. Erreur=', e);
        // continue vers fallback Firestore
      }
    }

    // 6) – Firestore fallback
    const ref = await this.afs.collection(`patients/${pid}/prescriptions`).add(fsPayload);
    return ref.id;

    
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
    const uid = firebase.auth().currentUser?.uid || null;
    if (!uid) throw new Error('Utilisateur non authentifié');
  
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const safeRepeat = sanitizeRepeat((data as any)?.repeat);
  
    const payload = stripUndefinedDeep({
      completed: false,
      ...data,
      repeat: safeRepeat,             // jamais d'undefined à l’intérieur
      patientId: pid,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    });
  
    // Petit helper : si apiBase est vide/indéfini, on passe direct en Firestore
    const hasApi = !!(this.base && this.base.trim());
  
    // 1) API d’abord
    if (hasApi) {
      try {
        console.log('[addTask] POST API ->', `${this.base}/patients/${pid}/tasks`, payload);
        const { id } = await firstValueFrom(
          this.http.post<{ id: string }>(`${this.base}/patients/${pid}/tasks`, payload)
        );
        console.log('[addTask] API OK id=', id);
        return id;
      } catch (e) {
        console.warn('[addTask] API KO, fallback Firestore. Erreur=', e);
        // et on enchaîne le fallback Firestore ci-dessous
      }
    } else {
      console.log('[addTask] Pas d’API configurée, Firestore direct.');
    }
  
    // 2) Firestore fallback
    try {
      console.log('[addTask] Firestore add ->', `patients/${pid}/tasks`, payload);
      const ref = await this.afs.collection(`patients/${pid}/tasks`).add(payload);
      console.log('[addTask] Firestore OK id=', ref.id);
      return ref.id;
    } catch (e) {
      console.error('[addTask] Firestore KO', e);
      throw e; // remonte l’erreur au composant (snackbar)
    }
  }
  

  /* ====================== Assessments ====================== */
  listAssessments(pid: string) {
    return this.afs
      .collection<Assessment>(`patients/${pid}/assessments`, ref => ref.orderBy('createdAt', 'desc'))
      .valueChanges({ idField: 'id' });
  }

  async addAssessment(pid: string, data: Partial<Assessment>) {
    const now = firebase.firestore.FieldValue.serverTimestamp();

    const payload = stripUndefinedDeep({
      status: 'open',
      ...data,
      patientId: pid,
      createdBy: this.currentUserUid,
      createdAt: now,
      updatedAt: now,
    });

    try {
      const { id } = await firstValueFrom(
        this.http.post<{ id: string }>(`${this.base}/patients/${pid}/assessments`, payload)
      );
      return id;
    } catch {
      const ref = await this.afs.collection(`patients/${pid}/assessments`).add(payload);
      return ref.id;
    }
  }

  /* ======================= Patients ======================== */
  getPatient(id: string): Observable<any> {
    return this.afs
      .doc(`patients/${id}`)
      .snapshotChanges()
      .pipe(map(s => (s.payload.exists ? { id: s.payload.id, ...(s.payload.data() as any) } : null)));
  }
  /* -------- Patients (global) -------- */


  // --- GLOBAL ---
  listAllPatients(): Observable<Patient[]> {
    return this.afs.collection<Patient>('patients', ref => ref.orderBy('createdAt','desc'))
      .valueChanges({ idField: 'id' });
  }
  listAllTasks(): Observable<NurseTask[]> {
    return this.afs.collectionGroup<NurseTask>('tasks', ref => ref.orderBy('dueAt','asc'))
      .valueChanges({ idField: 'id' });
  }



  /**
   * Crée une tâche (simples ou récurrente).
   * - Si repeat.enabled: on crée **la 1ère occurrence** (occurrenceIndex=0) avec parentTaskId = idMaster
   * - Et on garde un doc “master” (facultatif) pour stocker la règle (utile si tu veux l’éditer plus tard)
   */
  

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
    const candidates = nextDate(curDate, rule);     // tableau (par ex. plusieurs weekdays)
    // on prend la 1ère date > current (tri implicite assuré par nextDate)
    const next = candidates.sort((a,b)=>a.getTime()-b.getTime())[0];

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

    if (!ok) return; // pas de prochaine occurrence

    // Créer prochaine occurrence
    await this.afs.collection(`patients/${pid}/tasks`).add(stripUndefinedDeep({
      patientId: pid,
      title: cur.title,
      notes: cur.notes || '',
      dueAt: toTs(next),
      completed: false,
      repeat: cur.repeat,                 // on copie la règle (optionnel)
      parentTaskId: cur.parentTaskId || cur.id || tid,
      occurrenceIndex: (cur.occurrenceIndex ?? 0) + 1,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
  }
}
