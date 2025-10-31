// src/app/nurse/service/assessments.service.ts
import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import firebase from 'firebase/compat/app';
import { environment } from 'src/environments/environment';
import {
  Assessment, AssessmentType, Esign, Braden, SkinWeekly, PressureInjuryWeekly, ProgressNote, CarePlan
} from '../models/assessment.model';

const asObj = (x: any): Record<string, any> => (x && typeof x === 'object') ? x : {};

@Injectable({ providedIn: 'root' })
export class AssessmentsService {
  private afs = inject(AngularFirestore);
  private afAuth = inject(AngularFireAuth);
  private storage = inject(AngularFireStorage);
  private http = inject(HttpClient);
  private base = `${environment.apiBase || ''}`;

  private get uid(): string | null { return firebase.auth().currentUser?.uid || null; }

  // ---------- pdfmake (global) ----------
  private _pdfMake?: any;

  /** Grabs window.pdfMake and enforces a safe font family that always exists in vfs. */
  private getGlobalPdfMake(): any {
    const pm = (typeof window !== 'undefined' ? (window as any).pdfMake : undefined);
    if (!pm || !pm.vfs) {
      // If you land here, the global scripts weren't loaded (see angular.json section below).
      throw new Error('pdfmake vfs not found');
    }

    // One-time font hardening (idempotent)
    if (!pm.fonts || !pm.fonts.Fallback) {
      const keys = Object.keys(pm.vfs || {});
      if (!keys.length) throw new Error('pdfmake vfs is empty');

      // Prefer Roboto-Regular if present; else first available file in vfs
      const base = pm.vfs['Roboto-Regular.ttf'] ? 'Roboto-Regular.ttf' : keys[0];
      pm.fonts = {
        // Map all styles to a guaranteed file so we never request Roboto-Medium.ttf
        Fallback: { normal: base, bold: base, italics: base, bolditalics: base }
      };
    }
    return pm;
  }

  private async createBlob(docDef: any): Promise<Blob> {
    const pdfMake = this._pdfMake || (this._pdfMake = this.getGlobalPdfMake());
    const def = docDef || {};
    def.defaultStyle = { ...(def.defaultStyle || {}), font: 'Fallback' };
    return new Promise((resolve) => {
      pdfMake.createPdf(def).getBlob((b: Blob) => resolve(b));
    });
  }

  /* ===================== Lists ===================== */
  list(pid: string, type: AssessmentType) {
    return this.afs.collection<Assessment>(
      `patients/${pid}/assessments`,
      ref => ref.where('type', '==', type).orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  /* ===================== Add ===================== */
  async add(
    pid: string,
    data: Partial<Assessment> & { type: AssessmentType },
    esign: Omit<Esign, 'signedAt' | 'method'> & { role: Esign['role'] }
  ) {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const norm = (d: any) => d instanceof Date ? d : (d ? new Date(d) : null);

    const { type, ...rest } = asObj(data);

    const fsPayload: any = {
      ...asObj(rest),
      type,
      patientId: pid,
      createdBy: this.uid,
      createdAt: now,
      updatedAt: now,
      eSignature: {
        ...asObj(esign),
        method: 'password',
        signedAt: now
      }
    };

    // Normalize known date fields for Firestore compat serializer
    if ('visitDate' in fsPayload) fsPayload.visitDate = norm(fsPayload.visitDate);
    if ('targetDate' in fsPayload) fsPayload.targetDate = norm(fsPayload.targetDate);

    // API (optional) - JSON-safe payload
    const apiPayload: any = {
      ...fsPayload,
      createdAt: null, updatedAt: null,
      eSignature: { ...asObj(fsPayload.eSignature), signedAt: null }
    };
    if ('visitDate' in apiPayload && apiPayload.visitDate) {
      apiPayload.visitDate = new Date(apiPayload.visitDate).toISOString();
    }
    if ('targetDate' in apiPayload && apiPayload.targetDate) {
      apiPayload.targetDate = new Date(apiPayload.targetDate).toISOString();
    }

    let id: string | undefined;
    if (this.base.trim()) {
      try {
        const res = await firstValueFrom(
          this.http.post<{ id: string }>(`${this.base}/patients/${pid}/assessments`, apiPayload)
        );
        id = res.id;
      } catch {
        // Fallback to Firestore
      }
    }
    if (!id) {
      const ref = await this.afs.collection(`patients/${pid}/assessments`).add(fsPayload);
      id = ref.id;
    }

    // PDF creation + upload
    const pdfBlob = await this.makePdfBlob(pid, { ...asObj(fsPayload), id, type } as Assessment);
    const path = `patients/${pid}/assessments/${id}.pdf`;
    const task = await this.storage.upload(path, pdfBlob, { contentType: 'application/pdf' });
    const pdfUrl = await task.ref.getDownloadURL();
    await this.afs.doc(`patients/${pid}/assessments/${id}`).update({ pdfUrl });

    return id;
  }

  /* ===================== Compilations ===================== */
  async compileAdmission(pid: string) {
    const patSnap = await this.afs.doc(`patients/${pid}`).ref.get();
    const patient = patSnap.data() || {};
    const assSnap = await this.afs.collection(`patients/${pid}/assessments`).ref.get();
    const assessments = assSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as Assessment[];

    const rxSnap = await this.afs.collection(`patients/${pid}/prescriptions`).ref.get();
    const prescriptions = rxSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) }));

    const docDef: any = this.admissionDocDef(patient, prescriptions, assessments);
    const blob = await this.createBlob(docDef);
    const path = `patients/${pid}/reports/admission-${Date.now()}.pdf`;
    const task = await this.storage.upload(path, blob, { contentType: 'application/pdf' });
    return await task.ref.getDownloadURL();
  }

  async compileDischarge(pid: string) {
    const patSnap = await this.afs.doc(`patients/${pid}`).ref.get();
    const patient = patSnap.data() || {};
    const assSnap = await this.afs.collection(`patients/${pid}/assessments`).ref.get();
    const assessments = assSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as Assessment[];

    const rxSnap = await this.afs.collection(`patients/${pid}/prescriptions`).ref.get();
    const prescriptions = rxSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) }));

    const notes = assessments.filter(a => a.type === 'progressNote') as ProgressNote[];

    const docDef: any = this.dischargeDocDef(patient, prescriptions, assessments, notes);
    const blob = await this.createBlob(docDef);
    const path = `patients/${pid}/reports/discharge-${Date.now()}.pdf`;
    const task = await this.storage.upload(path, blob, { contentType: 'application/pdf' });
    return await task.ref.getDownloadURL();
  }

  /* ===================== Rx mini-report ===================== */
  async prescriptionReport(pid: string, rxId: string) {
    const rxDoc = await this.afs.doc(`patients/${pid}/prescriptions/${rxId}`).ref.get();
    const rx = { id: rxDoc.id, ...asObj(rxDoc.data()) } as any;
    const udaSnap = await this.afs.collection(
      `patients/${pid}/administrations`, ref => ref.where('rxId', '==', rxId)
    ).ref.get();
    const udas = udaSnap.docs.map(d => d.data());

    const docDef: any = {
      content: [
        { text: 'Prescription Report', style: 'h1' },
        { text: rx.name || '—', style: 'h2' },
        { text: `Dose: ${rx.dose || '—'} • Route: ${rx.route || '—'} • Freq: ${rx.frequency || '—'}` },
        { text: 'Administrations', style: 'h3', margin: [0, 10, 0, 6] },
        {
          table: {
            headerRows: 1,
            widths: ['auto','*','*'],
            body: [
              ['Date','Status','Dose Given'],
              ...udas.map((u: any) => [
                this.fmtDate(u.adminAt), u.status || '—', u.doseGiven || '—'
              ])
            ]
          }
        }
      ],
      styles: { h1:{fontSize:18,bold:true}, h2:{fontSize:14,bold:true}, h3:{fontSize:12,bold:true} }
    };

    const blob = await this.createBlob(docDef);
    const path = `patients/${pid}/reports/rx-${rxId}-${Date.now()}.pdf`;
    const task = await this.storage.upload(path, blob, { contentType: 'application/pdf' });
    return await task.ref.getDownloadURL();
  }

  // ----------------- PDF helpers -----------------
  private async makePdfBlob(_pid: string, a: Assessment): Promise<Blob> {
    const docDef = this.assessmentDocDef(a);
    return this.createBlob(docDef);
  }

  private assessmentDocDef(a: Assessment): any {
    const header = { text: `Assessment: ${a.type}`, style: 'h1' };
    const meta = { text: `Created: ${this.fmtDate(a.createdAt)} • By: ${a.eSignature?.signerName || a.eSignature?.signerEmail || '—'}`, margin:[0,0,0,8] };
    const body: any[] = [header, meta];
  
    if (a.type === 'braden') {
      // ... existing ...
    } else if (a.type === 'skinWeekly') {
      // ... existing ...
    } else if (a.type === 'pressureInjuryWeekly') {
      // ... existing ...
    } else if (a.type === 'progressNote') {
      // ... existing ...
    } else if (a.type === 'carePlan') {
      // ... existing ...
    } else if (a.type === 'vitals') {          // ⬅️ NEW
      const v = a as any;
      body.push(
        { text: `Measured: ${this.fmtDate(v.measuredAt)}`, style: 'h2', margin:[0,4,0,8] },
        {
          table: {
            widths: ['*','*','*','*'],
            body: [
              ['BP (mmHg)', 'HR (bpm)', 'RR (/min)', 'Temp (°C)'],
              [
                (v.systolic && v.diastolic) ? `${v.systolic}/${v.diastolic}` : '—',
                v.heartRate ?? '—',
                v.respiratoryRate ?? '—',
                v.temperatureC ?? '—'
              ],
              ['SpO₂ (%)', 'Pain (0-10)', 'Position', 'Device'],
              [
                v.spo2 ?? '—',
                v.painScore ?? '—',
                v.position || '—',
                v.device || '—'
              ]
            ]
          }
        },
        v.note ? { text: v.note, margin:[0,8,0,0] } : {}
      );
    }
  
    return { content: body, styles: { h1:{fontSize:16,bold:true}, h2:{fontSize:12,bold:true}, h3:{bold:true} } };
  }
  

  private admissionDocDef(patient: any, prescriptions: any[], assessments: Assessment[]) {
    return {
      content: [
        { text: 'Admission Summary', style: 'h1' },
        { text: `${patient?.name || '—'}  •  DOB: ${this.fmtDate(patient?.dob)}  •  Payor: ${patient?.paiement || '—'}`, margin: [0, 0, 0, 8] },
        { text: `Providers: ${patient?.docteur || '—'}` },
        { text: 'Prescriptions', style: 'h2', margin: [0, 10, 0, 4] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Medication', 'Dose', 'Route', 'Freq'],
              ...prescriptions.map(r => [r.name || '—', r.dose || '—', r.route || '—', r.frequency || '—'])
            ]
          }
        },
        { text: 'Assessments (latest)', style: 'h2', margin: [0, 10, 0, 4] },
        ...assessments.slice(0, 6).map(a => ({
          text: `${a.type} • ${this.fmtDate(a.createdAt)} • ${a.eSignature?.signerName || a.eSignature?.signerEmail || '—'}`
        }))
      ],
      styles: { h1: { fontSize: 18, bold: true }, h2: { fontSize: 13, bold: true } }
    };
  }

  private dischargeDocDef(patient: any, prescriptions: any[], assessments: Assessment[], notes: ProgressNote[]) {
    return {
      content: [
        { text: 'Discharge Summary', style: 'h1' },
        { text: `${patient?.name || '—'}  •  DOB: ${this.fmtDate(patient?.dob)}`, margin: [0, 0, 0, 8] },
        { text: 'Prescriptions at Discharge', style: 'h2', margin: [0, 10, 0, 4] },
        {
          table: {
            headerRows: 1, widths: ['*', 'auto', 'auto', 'auto'],
            body: [['Medication', 'Dose', 'Route', 'Freq'], ...prescriptions.map(r => [r.name || '—', r.dose || '—', r.route || '—', r.frequency || '—'])]
          }
        },
        { text: 'Progress Notes', style: 'h2', margin: [0, 10, 0, 4] },
        ...notes.map(n => ({
          text: `${this.fmtDate(n.visitDate)} • ${n.authorRole} • ${n.eSignature?.signerName || n.eSignature?.signerEmail || '—'}`
        })),
        { text: 'Assessments', style: 'h2', margin: [0, 10, 0, 4] },
        ...assessments.map(a => ({
          text: `${a.type} • ${this.fmtDate(a.createdAt)} • ${a.eSignature?.signerName || a.eSignature?.signerEmail || '—'}`
        }))
      ],
      styles: { h1: { fontSize: 18, bold: true }, h2: { fontSize: 13, bold: true } }
    };
  }

  private fmtDate(v: any): string {
    if (!v) return '—';
    const toDate = (x: any) =>
      (typeof x?.toDate === 'function') ? x.toDate()
        : (x?.seconds ? new Date(x.seconds * 1000) : new Date(x));
    const d = toDate(v);
    return isNaN(+d) ? '—' : d.toLocaleString();
  }


  
}
