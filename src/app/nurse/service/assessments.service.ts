// src/app/nurse/service/assessments.service.ts
import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { environment } from 'src/environments/environment';

// Home wound care model
import { Patient, Rx, NurseTask, Assessment } from '../models/patient.model';

// ✅ Use your CloudPrintService (adjust the path if different)
import { CloudPrintService } from 'src/app/service/cloud-print.service';

const DEBUG = true;

const asObj = (x: any): Record<string, any> =>
  (x && typeof x === 'object' && !Array.isArray(x)) ? x : {};

// Detect Firestore sentinels to preserve (no deep clone)
function isFirestoreSpecial(x: any): boolean {
  if (!x || typeof x !== 'object') return false;
  if (typeof x.toDate === 'function') return true;                         // Timestamp (compat)
  if (typeof x.seconds === 'number' && typeof x.nanoseconds === 'number') return true;
  if (typeof x.latitude === 'number' && typeof x.longitude === 'number')  return true; // GeoPoint
  if (typeof x.id === 'string' && typeof x.path === 'string' && x.parent) return true; // DocRef
  if (typeof x._methodName === 'string') return true;                      // FieldValue
  if (typeof x.isEqual === 'function' && x.constructor &&
      String(x.constructor.name).includes('FieldValue')) return true;
  return false;
}

/** Clean `undefined` but KEEP Firestore sentinels/objects. */
function stripUndefined<T>(value: T): T {
  if (value === undefined) return value;
  if (Array.isArray(value)) return value.map(v => stripUndefined(v)) as unknown as T;
  if (value && typeof value === 'object') {
    if (isFirestoreSpecial(value)) return value;
    const out: any = {};
    for (const [k, v] of Object.entries(value as any)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v as any);
    }
    return out;
  }
  return value;
}

function safeJson(v: any): any {
  try { return JSON.parse(JSON.stringify(v)); } catch { return v; }
}

@Injectable({ providedIn: 'root' })
export class AssessmentsService {
  private afs = inject(AngularFirestore);
  private afAuth = inject(AngularFireAuth);
  private cloudPrint = inject(CloudPrintService);
  // kept for future API needs
  private base = `${environment.apiBase || ''}`;

  private readonly clinicLogoUrl =
    'https://res.cloudinary.com/dtdpx59sc/image/upload/v1760108013/ChatGPT_Image_Oct_2_2025_03_19_58_PM_om8pic.png';

  private async requireUid(): Promise<string> {
    const u = await this.afAuth.currentUser;
    if (!u?.uid) throw new Error('Not authenticated');
    return u.uid;
  }

  // ===================== Assessments (CRUD) =====================

  listAssessments(pid: string, program?: Assessment['program']) {
    return this.afs.collection<Assessment>(
      `patients/${pid}/assessments`,
      ref => program
        ? ref.where('program', '==', program).orderBy('createdAt', 'desc')
        : ref.orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  /** Add a new assessment and auto-generate + attach its PDF URL via Cloud Function. */
  async addAssessment(
    pid: string,
    data: Partial<Assessment> & { program: Assessment['program'] }
  ) {
    const uid = await this.requireUid();
    const now = firebase.firestore.FieldValue.serverTimestamp();

    const fsPayload = stripUndefined({
      ...asObj(data),
      patientId: pid,                         // REQUIRED by rules
      createdBy: uid,                         // REQUIRED by rules
      createdAt: now,                         // REQUIRED by rules
      updatedAt: now,
      status: (data.status ?? 'submitted')
    });

    if (DEBUG) {
      console.log('[ADD] path', `patients/${pid}/assessments`);
      console.log('[ADD] auth.uid', uid);
      console.log('[ADD] fsPayload', safeJson(fsPayload));
    }

    // 1) CREATE (rules check here)
    let ref;
    try {
      ref = await this.afs.collection(`patients/${pid}/assessments`).add(fsPayload);
    } catch (e) {
      console.error('[ADD] CREATE failed (rules?)', e);
      throw e;
    }

    const id = ref.id;
    if (DEBUG) console.log('[ADD] CREATE ok, id=', id);

    // 2) Render PDF server-side (no client Storage writes)
    let pdfUrl: string | undefined;
    try {
      const printable = this.toPrintableAssessment(pid, id, fsPayload);
      const resp = await this.cloudPrint.print('assessment', printable, { urlExpiryHours: 168 });
      pdfUrl = resp?.url;
      if (DEBUG) console.log('[ADD] PRINT ok, url=', pdfUrl);
    } catch (e) {
      console.error('[ADD] PRINT failed', e);
      // Do not fail the whole operation if print fails
    }

    // 3) UPDATE doc with pdfUrl + updatedAt
    try {
      const updatePayload: any = { updatedAt: now };
      if (pdfUrl) updatePayload.pdfUrl = pdfUrl;
      if (DEBUG) console.log('[ADD] UPDATE payload', safeJson(updatePayload));
      await this.afs.doc(`patients/${pid}/assessments/${id}`).update(updatePayload);
      if (DEBUG) console.log('[ADD] UPDATE ok');
    } catch (e) {
      console.error('[ADD] UPDATE failed (rules updatedAt?)', e);
    }

    return id;
  }

  // ===================== Admission/Discharge Compilations (via Cloud Print) =====================

  /** Compile an Admission PDF using the Cloud Function (type=custom) and return the signed URL. */
  async compileAdmission(pid: string): Promise<string> {
    try {
      const [patSnap, assSnap, rxSnap, tasksSnap] = await Promise.all([
        this.afs.doc(`patients/${pid}`).ref.get(),
        this.afs.collection(`patients/${pid}/assessments`).ref.get(),
        this.afs.collection(`patients/${pid}/prescriptions`).ref.get(),
        this.afs.collection(`patients/${pid}/tasks`).ref.get()
      ]);

      const patient = { id: patSnap.id, ...asObj(patSnap.data()) } as Patient;
      const assessments = assSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as Assessment[];
      const prescriptions = rxSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as Rx[];
      const tasks = tasksSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as NurseTask[];

      const html = this.admissionHtml(patient, prescriptions, assessments, tasks);
      const resp = await this.cloudPrint.print('custom', {
        title: 'Admission Record',
        subtitle: patient?.name ? `Patient: ${patient.name}` : '',
        html
      }, { urlExpiryHours: 168 });

      if (!resp?.url) throw new Error('No URL returned by print');
      if (DEBUG) console.log('[ADMISSION] url', resp.url);
      return resp.url;
    } catch (e) {
      console.error('[ADMISSION] failed', e);
      throw e;
    }
  }

  /** Compile a Discharge PDF via Cloud Print and return the signed URL. */
  async compileDischarge(pid: string): Promise<string> {
    try {
      const [patSnap, assSnap, rxSnap] = await Promise.all([
        this.afs.doc(`patients/${pid}`).ref.get(),
        this.afs.collection(`patients/${pid}/assessments`).ref.get(),
        this.afs.collection(`patients/${pid}/prescriptions`).ref.get()
      ]);

      const patient = { id: patSnap.id, ...asObj(patSnap.data()) } as Patient;
      const assessments = assSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as Assessment[];
      const prescriptions = rxSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as Rx[];

      const html = this.dischargeHtml(patient, prescriptions, assessments);
      const resp = await this.cloudPrint.print('custom', {
        title: 'Discharge Summary',
        subtitle: patient?.name ? `Patient: ${patient.name}` : '',
        html
      }, { urlExpiryHours: 168 });

      if (!resp?.url) throw new Error('No URL returned by print');
      if (DEBUG) console.log('[DISCHARGE] url', resp.url);
      return resp.url;
    } catch (e) {
      console.error('[DISCHARGE] failed', e);
      throw e;
    }
  }

  // ===================== Printable mappers =====================

  /** Shape Firestore payload into the Cloud Function's `assessment` template shape. */
  private toPrintableAssessment(pid: string, id: string, fsPayload: any) {
    const ans = asObj(fsPayload?.answers);
    const vitals = asObj(ans?.['vitals']);

    // Try to normalize vitals from various forms
    const bpStr = ans?.['bloodPressure'] ?? vitals?.['bp'] ?? '';
    const hrStr = ans?.['heartRate'] ?? vitals?.['hr'] ?? '';
    const tempStr = ans?.['temperatureC'] ?? vitals?.['temp'] ?? '';
    const rrStr = ans?.['respiratoryRate'] ?? vitals?.['rr'] ?? '';
    const spo2Str = ans?.['spo2'] ?? vitals?.['spo2'] ?? '';
    const weightStr = ans?.['weight'] ?? vitals?.['weight'] ?? '';

    const findingsArray = Array.isArray(ans?.['findings']) ? ans['findings'] : [];

    return {
      id,
      patient: {
        name: (fsPayload?.patientName ?? '') || (fsPayload?.patient?.name ?? ''),
        dob: (fsPayload?.patientDob ?? '') || (fsPayload?.patient?.dob ?? ''),
        id: pid
      },
      date: this.fmtDate(fsPayload?.assessedAt || fsPayload?.createdAt),
      assessor: ans?.['eSignature']?.signerName ?? '',
      location: fsPayload?.location ?? '',
      vitals: {
        bp: String(bpStr || ''),
        hr: String(hrStr || ''),
        temp: String(tempStr || ''),
        rr: String(rrStr || ''),
        spo2: String(spo2Str || ''),
        weight: String(weightStr || '')
      },
      findings: findingsArray,   // [{ description, severity, notes }, ...] if you have them
      signatures: null           // add {left,right} if you capture signature images later
    };
  }

  // ===================== Simple HTML builders for custom prints =====================

  private admissionHtml(patient: Patient, prescriptions: Rx[], assessments: Assessment[], tasks: NurseTask[]) {
    const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]!));
    const dt = (v: any) => esc(this.fmtDate(v));
    const val = (x: any, d = '—') => esc(x ?? d);

    const medsRows = (prescriptions || []).map(r => `
      <tr><td>${val((r as any).name)}</td><td>${val((r as any).dose)}</td><td>${val((r as any).route)}</td><td>${val((r as any).frequency)}</td></tr>
    `).join('') || `<tr><td colspan="4">—</td></tr>`;

    const assessRows = (assessments || [])
      .sort((a,b) => +new Date((b as any)?.createdAt?.toDate?.() ?? (b as any)?.createdAt ?? 0) - +new Date((a as any)?.createdAt?.toDate?.() ?? (a as any)?.createdAt ?? 0))
      .slice(0, 6)
      .map(a => `<tr><td>${val((a as any).program)}</td><td>${val((a as any).status)}</td><td>${dt((a as any).assessedAt)}</td><td>${val((a as any).score)}</td></tr>`)
      .join('') || `<tr><td colspan="4">—</td></tr>`;

    const taskRows = (tasks || [])
      .filter(t => !(t as any).completed)
      .slice(0, 8)
      .map(t => `<tr><td>${val((t as any).type)}</td><td>${val((t as any).title)}</td><td>${dt((t as any).dueAt)}</td><td>${val((t as any).details)}</td></tr>`)
      .join('') || `<tr><td colspan="4">—</td></tr>`;

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#222; font-size:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div>
            <div style="font-size:20px;font-weight:700">PERRY HOME WOUND CARE • ADMISSION RECORD</div>
            <div>${val((patient as any).name)} • Created: ${dt((patient as any).createdAt)} • Phone: ${val((patient as any).phone)}</div>
          </div>
          <img src="${this.clinicLogoUrl}" style="height:56px"/>
        </div>
        <hr/>
        <h3>Patient</h3>
        <table style="width:100%;border-collapse:collapse" border="1" cellspacing="0" cellpadding="4">
          <tr><th>Name</th><td>${val((patient as any).name)}</td><th>DOB</th><td>${dt((patient as any).dob)}</td></tr>
          <tr><th>Phone</th><td>${val((patient as any).phone)}</td><th>Email</th><td>${val((patient as any).email)}</td></tr>
          <tr><th>Admission Date</th><td>${dt((patient as any).admissionDate)}</td><th>Code Status</th><td>${val((patient as any).codeStatus)}</td></tr>
        </table>

        <h3 style="margin-top:12px">Medications</h3>
        <table style="width:100%;border-collapse:collapse" border="1" cellspacing="0" cellpadding="4">
          <tr><th>Medication</th><th>Dose</th><th>Route</th><th>Frequency</th></tr>
          ${medsRows}
        </table>

        <h3 style="margin-top:12px">Assessments (Latest)</h3>
        <table style="width:100%;border-collapse:collapse" border="1" cellspacing="0" cellpadding="4">
          <tr><th>Program</th><th>Status</th><th>Assessed At</th><th>Score</th></tr>
          ${assessRows}
        </table>

        <h3 style="margin-top:12px">Open Nurse Tasks</h3>
        <table style="width:100%;border-collapse:collapse" border="1" cellspacing="0" cellpadding="4">
          <tr><th>Type</th><th>Title</th><th>Due</th><th>Details</th></tr>
          ${taskRows}
        </table>
      </div>
    `;
  }

  private dischargeHtml(patient: Patient, prescriptions: Rx[], assessments: Assessment[]) {
    const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]!));
    const dt = (v: any) => esc(this.fmtDate(v));
    const val = (x: any, d = '—') => esc(x ?? d);

    const medsRows = (prescriptions || []).map(r => `
      <tr><td>${val((r as any).name)}</td><td>${val((r as any).dose)}</td><td>${val((r as any).route)}</td><td>${val((r as any).frequency)}</td></tr>
    `).join('') || `<tr><td colspan="4">—</td></tr>`;

    const assessRows = (assessments || [])
      .sort((a,b) => +new Date((a as any)?.createdAt?.toDate?.() ?? (a as any)?.createdAt ?? 0) - +new Date((b as any)?.createdAt?.toDate?.() ?? (b as any)?.createdAt ?? 0))
      .slice(-10)
      .map(a => `<tr><td>${val((a as any).program)}</td><td>${val((a as any).status)}</td><td>${dt((a as any).assessedAt)}</td><td>${val((a as any).score)}</td></tr>`)
      .join('') || `<tr><td colspan="4">—</td></tr>`;

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#222; font-size:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:20px;font-weight:700">PERRY HOME WOUND CARE • DISCHARGE SUMMARY</div>
          <img src="${this.clinicLogoUrl}" style="height:56px"/>
        </div>
        <hr/>
        <table style="width:100%;border-collapse:collapse" border="1" cellspacing="0" cellpadding="4">
          <tr><th>Patient</th><td>${val((patient as any).name)}</td><th>DOB</th><td>${dt((patient as any).dob)}</td></tr>
          <tr><th>Phone</th><td>${val((patient as any).phone)}</td><th>Admission Date</th><td>${dt((patient as any).admissionDate)}</td></tr>
        </table>

        <h3 style="margin-top:12px">Prescriptions at Discharge</h3>
        <table style="width:100%;border-collapse:collapse" border="1" cellspacing="0" cellpadding="4">
          <tr><th>Medication</th><th>Dose</th><th>Route</th><th>Frequency</th></tr>
          ${medsRows}
        </table>

        <h3 style="margin-top:12px">Assessment History (Recent)</h3>
        <table style="width:100%;border-collapse:collapse" border="1" cellspacing="0" cellpadding="4">
          <tr><th>Program</th><th>Status</th><th>Assessed At</th><th>Score</th></tr>
          ${assessRows}
        </table>
      </div>
    `;
  }

  // ===================== Utilities =====================
  private fmtDate(v: any): string {
    if (!v) return '—';
    const toDate = (x: any) =>
      (typeof x?.toDate === 'function') ? x.toDate()
        : (x?.seconds ? new Date(x.seconds * 1000) : new Date(x));
    const d = toDate(v);
    return isNaN(+d) ? '—' : d.toLocaleString();
  }

  // ===================== Back-compat wrappers =====================

  private toProgramFromType(kind: string): 'Braden' | 'FallRisk' | 'Nutrition' | 'Wound' {
    return kind === 'braden' ? 'Braden' : 'Wound'; // others fold under Wound
  }

  public list(pid: string, kind: string) {
    return this.afs.collection(
      `patients/${pid}/assessments`,
      ref => ref.where('kind', '==', kind).orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' }) as unknown as import('rxjs').Observable<any[]>;
  }

  public async add(
    pid: string,
    data: any,
    esign: { signerUid?: string; signerEmail?: string|null; signerName?: string|null; role?: string } | null
  ) {
    const kind = String(data?.type ?? 'unknown');
    const program = this.toProgramFromType(kind);

    const assessedAt =
      data?.assessedAt ??
      data?.braden?.date ??
      data?.visitDate ??
      data?.measuredAt ??
      new Date();

    const { type: _drop, ...answers } = (data ?? {});
    if (esign) (answers as any).eSignature = esign;

    const shaped: Partial<Assessment> & { program: 'Braden'|'FallRisk'|'Nutrition'|'Wound'; kind?: string } = {
      program,
      assessedAt,
      status: (typeof data?.status === 'string' ? data.status : 'submitted'),
      kind,
      answers,
      ...(typeof (data as any)?.score === 'number' ? { score: (data as any).score } : {})
    };

    if (DEBUG) console.log('[ADD wrapper] shaped -> addAssessment', safeJson(shaped));
    return this.addAssessment(pid, stripUndefined(shaped));
  }

  getAssessment(pid: string, id: string) {
    return this.afs.doc<Assessment>(`patients/${pid}/assessments/${id}`).valueChanges({ idField: 'id' });
  }

  // Optional helper if you want to trigger print later manually
  async addAndAttachPdf(patientId: string, docId: string, printable: any) {
    try {
      const resp = await this.cloudPrint.print('assessment', printable, { urlExpiryHours: 168 });
      const updatePayload: any = {
        pdfUrl: resp?.url ?? '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      await this.afs.doc(`patients/${patientId}/assessments/${docId}`).update(updatePayload);
    } catch (e) {
      console.error('[addAndAttachPdf] failed', e);
      throw e;
    }
  }

  async updateAssessment(a: string, b: any, c?: Partial<Assessment>) {
    const hasPid = typeof c !== 'undefined';
    const pid = hasPid ? a : (await this.requireUid());
    const id  = hasPid ? b : a;
    const data = hasPid ? c! : b;

    if (!pid) throw new Error('Patient id not resolved');
    const fsPayload = stripUndefined({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    if (DEBUG) {
      console.log('[UPDATE] path', `patients/${pid}/assessments/${id}`);
      console.log('[UPDATE] payload', safeJson(fsPayload));
    }

    try {
      return await this.afs.doc<Assessment>(`patients/${pid}/assessments/${id}`).update(fsPayload);
    } catch (e) {
      console.error('[UPDATE] failed (rules?)', e);
      throw e;
    }
  }

  patchAssessment(a: string, b: any, c?: Partial<Assessment>) {
    return this.updateAssessment(a as any, b as any, c as any);
  }

  upsertAssessment(pid: string, data: Partial<Assessment> & { id?: string }) {
    const id = (data as any).id;
    if (id) return this.updateAssessment(pid, id, data);
    return this.addAssessment(pid, data as any);
  }

  saveAssessment(pid: string, data: Partial<Assessment> & { id?: string }) {
    return this.upsertAssessment(pid, data);
  }

  async discontinueAssessment(a: string, b?: string) {
    const hasPid = typeof b === 'string';
    const pid = hasPid ? a : (await this.requireUid());
    const id  = hasPid ? b! : a;
    if (!pid) throw new Error('Patient id not resolved');

    const payload = {
      discontinued: true,
      discontinuedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (DEBUG) {
      console.log('[DISCONTINUE] path', `patients/${pid}/assessments/${id}`);
      console.log('[DISCONTINUE] payload', safeJson(payload));
    }

    try {
      return await this.afs.doc<Assessment>(`patients/${pid}/assessments/${id}`).update(payload as Partial<Assessment>);
    } catch (e) {
      console.error('[DISCONTINUE] failed (rules?)', e);
      throw e;
    }
  }

  async removeAssessment(a: string, b?: string) {
    const hasPid = typeof b === 'string';
    const pid = hasPid ? a : (await this.requireUid());
    const id  = hasPid ? b! : a;
    if (!pid) throw new Error('Patient id not resolved');

    if (DEBUG) console.log('[DELETE] path', `patients/${pid}/assessments/${id}`);

    try {
      return await this.afs.doc<Assessment>(`patients/${pid}/assessments/${id}`).delete();
    } catch (e) {
      console.error('[DELETE] failed (rules?)', e);
      throw e;
    }
  }
  deleteAssessment(a: string, b?: string) {
    return this.removeAssessment(a as any, b as any);
  }
}
