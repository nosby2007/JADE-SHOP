// src/app/nurse/service/nurse-data.service.ts
import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { environment } from 'src/environments/environment';
import { Rx, NurseTask, Assessment } from '../models/patient.model';
import { stripUndefinedDeep, sanitizeRepeat } from './utils';

@Injectable({ providedIn: 'root' })
export class NurseDataService {
  private afs = inject(AngularFirestore);
  private afAuth = inject(AngularFireAuth);
  private http = inject(HttpClient);
  private base = `${environment.apiBase}`; // ex: https://.../api

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

  async addRx(pid: string, data: Partial<Rx>) {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const payload = stripUndefinedDeep({
      ...data,
      patientId: pid,
      createdBy: this.currentUserUid,
      createdAt: now,
      updatedAt: now,
    });

    try {
      // Si ton backend expose cette route, sinon ça tombera en fallback
      const { id } = await firstValueFrom(
        this.http.post<{ id: string }>(`${this.base}/patients/${pid}/prescriptions`, payload)
      );
      return id;
    } catch {
      const ref = await this.afs.collection(`patients/${pid}/prescriptions`).add(payload);
      return ref.id;
    }
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
  
  async completeTask(pid: string, tid: string, completed = true) {
    const patch = stripUndefinedDeep({
      completed,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    try {
      await firstValueFrom(this.http.patch(`${this.base}/patients/${pid}/tasks/${tid}`, patch));
    } catch {
      await this.afs.doc(`patients/${pid}/tasks/${tid}`).update(patch as any);
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
}
