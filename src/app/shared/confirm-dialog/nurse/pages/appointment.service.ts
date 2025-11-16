import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable, map } from 'rxjs';

export type ApptStatus = 'scheduled' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';

export interface AppointmentDoc {
  id?: string;
  patientId: string;
  patientName: string | null;                      // never undefined
  date: firebase.firestore.Timestamp;             // Firestore Timestamp
  reason?: string | null;
  notes?: string | null;
  status: ApptStatus;

  createdAt: any;
  createdBy: string;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private afs = inject(AngularFirestore);
  private auth = inject(AngularFireAuth);

  private readonly colPath = 'appointments';

  /* ====================== Utils ====================== */

  private toTimestamp(d: Date | firebase.firestore.Timestamp): firebase.firestore.Timestamp {
    // Accepts a JS Date or an existing Firestore Timestamp
    // Ensures we always store a Firestore Timestamp in 'date'
    // @ts-ignore - type guard
    return (d && typeof (d as any).toDate === 'function')
      ? (d as firebase.firestore.Timestamp)
      : firebase.firestore.Timestamp.fromDate(d as Date);
  }

  private sanitizeText(v: any): string | null {
    if (v == null) return null;
    const s = String(v).trim();
    return s.length ? s : null;
  }

  /* ====================== Create ====================== */

  /**
   * Create an appointment in root /appointments.
   * All optional string fields are normalized to null (never undefined).
   */
  async createAppointment(data: {
    patientId: string;
    patientName?: string | null;
    date: Date | firebase.firestore.Timestamp;
    reason?: string | null;
    notes?: string | null;
    status?: ApptStatus;
  }): Promise<string> {
    if (!data?.patientId) throw new Error('patientId required');
    if (!data?.date) throw new Error('date required');

    const user = await this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const payload: Omit<AppointmentDoc, 'id'> = {
      patientId: data.patientId,
      patientName: data.patientName ?? null,
      date: this.toTimestamp(data.date),
      reason: this.sanitizeText(data.reason ?? null),
      notes: this.sanitizeText(data.notes ?? null),
      status: (data.status ?? 'scheduled'),

      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: user.uid,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await this.afs.collection<AppointmentDoc>(this.colPath).add(payload);
    return ref.id;
  }

  /* ====================== Read ====================== */

  getAppointment$(id: string): Observable<AppointmentDoc | undefined> {
    return this.afs.doc<AppointmentDoc>(`${this.colPath}/${id}`)
      .snapshotChanges()
      .pipe(
        map(snap => {
          const data = snap.payload.data();
          return snap.payload.exists && data ? ({ id: snap.payload.id, ...data }) : undefined;
        })
      );
  }

  /** All appointments for a patient, newest first */
  appointmentsForPatient$(patientId: string): Observable<AppointmentDoc[]> {
    return this.afs.collection<AppointmentDoc>(
      this.colPath,
      ref => ref.where('patientId', '==', patientId).orderBy('date', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  /** Appointments on a specific calendar day (local time) */
  appointmentsOnDay$(day: Date): Observable<AppointmentDoc[]> {
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end = new Date(day);   end.setHours(23, 59, 59, 999);
    const startTs = firebase.firestore.Timestamp.fromDate(start);
    const endTs   = firebase.firestore.Timestamp.fromDate(end);

    return this.afs.collection<AppointmentDoc>(
      this.colPath,
      ref => ref.where('date', '>=', startTs).where('date', '<=', endTs).orderBy('date', 'asc')
    ).valueChanges({ idField: 'id' });
  }

  /** Appointments in a date range (inclusive) */
  appointmentsRange$(start: Date, end: Date): Observable<AppointmentDoc[]> {
    const startTs = firebase.firestore.Timestamp.fromDate(start);
    const endTs   = firebase.firestore.Timestamp.fromDate(end);
    return this.afs.collection<AppointmentDoc>(
      this.colPath,
      ref => ref.where('date', '>=', startTs).where('date', '<=', endTs).orderBy('date', 'asc')
    ).valueChanges({ idField: 'id' });
  }

  /* ====================== Update ====================== */

  /**
   * Update an appointment. Immutable fields (patientId, createdAt, createdBy) are NOT sent.
   * Also normalizes optional strings to null and ensures 'date' remains a Timestamp.
   */
  async updateAppointment(id: string, change: Partial<AppointmentDoc>): Promise<void> {
    if (!id) throw new Error('id required');

    const patch: any = {
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if ('date' in change && change.date) {
      patch.date = this.toTimestamp(change.date as any);
    }
    if ('status' in change && change.status) {
      patch.status = change.status;
    }
    if ('patientName' in change) {
      patch.patientName = change.patientName ?? null;
    }
    if ('reason' in change) {
      patch.reason = this.sanitizeText(change.reason ?? null);
    }
    if ('notes' in change) {
      patch.notes = this.sanitizeText(change.notes ?? null);
    }

    // DO NOT send immutable fields; rules require they remain unchanged
    // (patientId, createdAt, createdBy are intentionally omitted)

    await this.afs.doc(`${this.colPath}/${id}`).update(patch);
  }

  async setStatus(id: string, status: ApptStatus): Promise<void> {
    await this.updateAppointment(id, { status });
  }

  /* ====================== Delete ====================== */

  async deleteAppointment(id: string): Promise<void> {
    if (!id) throw new Error('id required');
    await this.afs.doc(`${this.colPath}/${id}`).delete();
  }
}
