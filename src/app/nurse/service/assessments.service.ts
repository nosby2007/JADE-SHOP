import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import firebase from 'firebase/compat/app';
import { environment } from 'src/environments/environment';

// Home wound care model
import { Patient, Rx, NurseTask, Assessment } from '../models/patient.model';

const DEBUG = true;

const asObj = (x: any): Record<string, any> =>
  (x && typeof x === 'object' && !Array.isArray(x)) ? x : {};

// Détecte les objets Firestore à préserver (ne PAS cloner)
function isFirestoreSpecial(x: any): boolean {
  if (!x || typeof x !== 'object') return false;

  // Timestamp (compat/SDK) : possède toDate() ou seconds/nanoseconds
  if (typeof x.toDate === 'function') return true;
  if (typeof x.seconds === 'number' && typeof x.nanoseconds === 'number') return true;

  // GeoPoint
  if (typeof x.latitude === 'number' && typeof x.longitude === 'number') return true;

  // DocumentReference (compat)
  if (typeof x.id === 'string' && typeof x.path === 'string' && x.parent) return true;

  // FieldValue (compat) – souvent porte _methodName ou une méthode isEqual
  if (typeof x._methodName === 'string') return true;
  if (typeof x.isEqual === 'function' && x.constructor && String(x.constructor.name).includes('FieldValue')) return true;

  return false;
}

/** Nettoie les `undefined` mais PRÉSERVE les sentinelles/objets Firestore. */
function stripUndefined<T>(value: T): T {
  if (value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map(v => stripUndefined(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    // ⚠️ ne pas décomposer les objets Firestore spéciaux
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

/** Safely stringify Firestore payloads containing serverTimestamp transforms */
function safeJson(v: any): any {
  try {
    return JSON.parse(JSON.stringify(v));
  } catch {
    return v;
  }
}

@Injectable({ providedIn: 'root' })
export class AssessmentsService {
  private afs = inject(AngularFirestore);
  private afAuth = inject(AngularFireAuth);
  private storage = inject(AngularFireStorage);
  private http = inject(HttpClient);
  private base = `${environment.apiBase || ''}`;

  private async requireUid(): Promise<string> {
    const u = await this.afAuth.currentUser;
    if (!u?.uid) throw new Error('Not authenticated');
    return u.uid;
  }

  // ---------- pdfmake (global) ----------
  private _pdfMake?: any;
  private getGlobalPdfMake(): any {
    const pm = (typeof window !== 'undefined' ? (window as any).pdfMake : undefined);
    if (!pm || !pm.vfs) throw new Error('pdfmake vfs not found');

    if (!pm.fonts || !pm.fonts.Fallback) {
      const keys = Object.keys(pm.vfs || {});
      if (!keys.length) throw new Error('pdfmake vfs is empty');
      const base = pm.vfs['Roboto-Regular.ttf'] ? 'Roboto-Regular.ttf' : keys[0];
      pm.fonts = { Fallback: { normal: base, bold: base, italics: base, bolditalics: base } };
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

  // ===================== Branding =====================
  private readonly clinicLogoUrl =
    'https://res.cloudinary.com/dtdpx59sc/image/upload/v1760108013/ChatGPT_Image_Oct_2_2025_03_19_58_PM_om8pic.png';
  private _logoDataUrl?: string;

  private async getLogoDataUrl(): Promise<string> {
    if (this._logoDataUrl) return this._logoDataUrl;
    const blob = await firstValueFrom(this.http.get(this.clinicLogoUrl, { responseType: 'blob' }));
    this._logoDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return this._logoDataUrl!;
  }

  private clinicHeaderBlock(): any[] {
    const leftCol = [
      { text: '211 RUSTY PLOW LANE PERRY GA', fontSize: 9, margin: [0, 0, 0, 2] },
      { text: '31069', fontSize: 9, margin: [0, 0, 0, 6] },
      { text: 'Website:', bold: true, fontSize: 9, margin: [0, 0, 0, 0] },
      {
        text: 'https://perryhomewoundcare.network',
        fontSize: 9,
        link: 'https://perryhomewoundcare.network',
        color: '#1a0dab'
      },
    ];

    const rightCol = [
      { text: 'Willy A Yougang Tchoutang, AGNP', bold: true, italics: true, alignment: 'right', fontSize: 11, margin: [0, 0, 0, 4] },
      { text: 'Co-founder chief clinical Director', alignment: 'right', fontSize: 9, margin: [0, 0, 0, 4] },
      { text: 'Nurse Practitioner', alignment: 'right', fontSize: 9, margin: [0, 0, 0, 4] },
      { text: 'Tel: (423)521-2298', alignment: 'right', fontSize: 9, margin: [0, 0, 0, 4] },
      {
        text: 'Email: support@perryhomewoundcare.network',
        alignment: 'right',
        fontSize: 8,
        link: 'mailto:support@perryhomewoundcare.network',
        color: '#1a0dab',
        margin: [0, 0, 0, 4]
      }
    ];

    return [
      {
        table: {
          widths: [200, 80, 220],
          body: [[
            { stack: leftCol, border: [false, false, false, false] },
            { image: 'clinicLogo', width: 64, alignment: 'center', border: [false, false, false, false] },
            { stack: rightCol, border: [false, false, false, false] }
          ]]
        },
        layout: 'noBorders',
        alignment: 'center',
        margin: [0, 0, 0, 6]
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }], margin: [0, 4, 0, 10] }
    ];
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

  /** Add a new assessment and auto-generate/upload its PDF. (Conforms to Firestore Rules) */
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
      createdAt: now,                         // REQUIRED by rules (serverTimestamp)
      updatedAt: now,
      status: (data.status ?? 'submitted')
    });

    if (DEBUG) {
      console.log('[ADD] path', `patients/${pid}/assessments`);
      console.log('[ADD] auth.uid', uid);
      console.log('[ADD] fsPayload', safeJson(fsPayload));
    }

    // CREATE (this is where "permission-denied" happens if canCreateSub() échoue)
    let ref;
    try {
      ref = await this.afs.collection(`patients/${pid}/assessments`).add(fsPayload);
    } catch (e) {
      console.error('[ADD] CREATE failed (rules?)', e);
      throw e;
    }

    const id = ref.id;
    if (DEBUG) console.log('[ADD] CREATE ok, id=', id);

    // PDF create + upload
    let pdfUrl: string | undefined;
    try {
      const pdfBlob = await this.makeAssessmentPdfBlob(pid, ({ ...fsPayload, id } as unknown) as Assessment);
      const path = `patients/${pid}/assessments/${id}.pdf`;
      if (DEBUG) console.log('[ADD] UPLOAD path', path);
      const task = await this.storage.upload(path, pdfBlob, { contentType: 'application/pdf' });
      pdfUrl = await task.ref.getDownloadURL();
      if (DEBUG) console.log('[ADD] UPLOAD ok, url=', pdfUrl);
    } catch (e) {
      console.error('[ADD] PDF/UPLOAD failed (Storage rules?)', e);
      // On continue sans PDF pour ne pas supprimer le doc créé
    }

    // UPDATE (ajout pdfUrl + updatedAt) — nécessite canUpdateSub() (updatedAt timestamp/serverTS)
    try {
      const updatePayload: any = {
        updatedAt: now
      };
      if (pdfUrl) updatePayload.pdfUrl = pdfUrl;

      if (DEBUG) console.log('[ADD] UPDATE payload', safeJson(updatePayload));
      await this.afs.doc(`patients/${pid}/assessments/${id}`).update(updatePayload);
      if (DEBUG) console.log('[ADD] UPDATE ok');
    } catch (e) {
      console.error('[ADD] UPDATE failed (rules updatedAt?)', e);
      // Le doc reste créé; seul l'update échoue.
    }

    return id;
  }

  // ===================== Compilations (PDFs) =====================

  async compileAdmission(pid: string) {
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

      const docDef = this.admissionDocDefHome(patient, prescriptions, assessments, tasks);
      const logo = await this.getLogoDataUrl();
      (docDef as any).images = { clinicLogo: logo };
      (docDef as any).content = [...this.clinicHeaderBlock(), ...(docDef as any).content];

      const blob = await this.createBlob(docDef);
      const path = `patients/${pid}/reports/admission-${Date.now()}.pdf`;
      if (DEBUG) console.log('[ADMISSION] upload path', path);
      const task = await this.storage.upload(path, blob, { contentType: 'application/pdf' });
      const url = await task.ref.getDownloadURL();
      if (DEBUG) console.log('[ADMISSION] url', url);
      return url;
    } catch (e) {
      console.error('[ADMISSION] failed', e);
      throw e;
    }
  }

  async compileDischarge(pid: string) {
    try {
      const [patSnap, assSnap, rxSnap] = await Promise.all([
        this.afs.doc(`patients/${pid}`).ref.get(),
        this.afs.collection(`patients/${pid}/assessments`).ref.get(),
        this.afs.collection(`patients/${pid}/prescriptions`).ref.get()
      ]);

      const patient = { id: patSnap.id, ...asObj(patSnap.data()) } as Patient;
      const assessments = assSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as Assessment[];
      const prescriptions = rxSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as Rx[];

      const docDef = this.dischargeDocDefHome(patient, prescriptions, assessments);
      const logo = await this.getLogoDataUrl();
      (docDef as any).images = { clinicLogo: logo };
      (docDef as any).content = [...this.clinicHeaderBlock(), ...(docDef as any).content];

      const blob = await this.createBlob(docDef);
      const path = `patients/${pid}/reports/discharge-${Date.now()}.pdf`;
      if (DEBUG) console.log('[DISCHARGE] upload path', path);
      const task = await this.storage.upload(path, blob, { contentType: 'application/pdf' });
      const url = await task.ref.getDownloadURL();
      if (DEBUG) console.log('[DISCHARGE] url', url);
      return url;
    } catch (e) {
      console.error('[DISCHARGE] failed', e);
      throw e;
    }
  }

  // ===================== Assessment PDF =====================

  private async makeAssessmentPdfBlob(_pid: string, a: Assessment): Promise<Blob> {
    const docDef = this.assessmentDocDefHome(a);
    const logo = await this.getLogoDataUrl();
    (docDef as any).images = { clinicLogo: logo };
    (docDef as any).content = [...this.clinicHeaderBlock(), ...(docDef as any).content];
    return this.createBlob(docDef);
  }

  // ===================== PDF Document Definitions =====================

  private assessmentDocDefHome(a: Assessment): any {
    const header = { text: `Assessment: ${a.program}`, style: 'h1', color: 'black' };
    const meta = { text: `Assessed: ${this.fmtDate((a as any).assessedAt)} • Status: ${a.status || '—'}`, margin:[0,0,0,8] };
    const body: any[] = [header, meta];

    if ((a as any).answers && typeof (a as any).answers === 'object') {
      const rows = Object.entries((a as any).answers).map(([k, v]) => [
        { text: String(k), bold: true },
        (typeof v === 'object' ? JSON.stringify(stripUndefined(v), null, 0) : String(v ?? '—'))
      ]);
      body.push({
        table: { widths: ['*','*'], body: rows.length ? rows : [['No data','—']] },
        layout: 'lightHorizontalLines',
        margin: [0, 6, 0, 0]
      });
    } else {
      body.push({ text: 'No answers provided.', italics: true, margin:[0,6,0,0] });
    }

    if (typeof (a as any).score === 'number') {
      body.push({ text: `Score: ${(a as any).score}`, margin:[0,6,0,0] });
    }

    return {
      content: body,
      styles: { h1:{fontSize:16,bold:true}, h2:{fontSize:12,bold:true} },
      defaultStyle: { font: 'Fallback', fontSize: 10 }
    };
  }

  private admissionDocDefHome(
    patient: Patient,
    prescriptions: Rx[],
    assessments: Assessment[],
    tasks: NurseTask[]
  ) {
    const val = (x: any, d: any = '—') => (x ?? d);
    const dt  = (x: any) => this.fmtDate(x);
    const section = (t: string) => ({ text: t, style: 'h2', margin: [0, 12, 0, 6] });

    const twoCol = (rows: any[][]) => ({
      table: { widths: ['*','*'], body: rows },
      layout: 'lightHorizontalLines'
    });

    const tableN = (headerRow: any[], rows: any[][], widths?: (string | number)[]) => ({
      table: {
        headerRows: 1,
        widths: widths && widths.length ? widths : Array(headerRow.length).fill('*'),
        body: [headerRow, ...rows]
      },
      layout: 'lightHorizontalLines'
    });

    const headerBlock = [
      { text: 'PERRY HOME WOUND CARE • ADMISSION RECORD', style: 'h1', color: 'black' },
      { text: `${val((patient as any).name)} • Created: ${dt((patient as any).createdAt)} • Phone: ${val((patient as any).phone)}`, margin:[0,0,0,8] }
    ];

    const fullAddr = [val((patient as any).address), val((patient as any).address1), val((patient as any).address2), val((patient as any).city), val((patient as any).state), val((patient as any).zip)]
      .filter(Boolean).join(', ') || '—';

    const patientInfo = twoCol([
      [{ text: 'Name', bold: true }, val((patient as any).name)],
      [{ text: 'Preferred Name', bold: true }, val((patient as any).preferredName)],
      [{ text: 'Gender', bold: true }, val((patient as any).gender)],
      [{ text: 'Date of Birth', bold: true }, dt((patient as any).dob)],
      [{ text: 'Phone', bold: true }, val((patient as any).phone)],
      [{ text: 'Email', bold: true }, val((patient as any).email)],
      [{ text: 'Address', bold: true }, fullAddr],
      [{ text: 'Emergency Contact', bold: true }, val((patient as any).emergencyContact?.name || (patient as any).emergencyContactName)],
      [{ text: 'Emergency Phone', bold: true }, val((patient as any).emergencyContact?.phone || (patient as any).emergencyContactPhone)],
      [{ text: 'Emergency Relation', bold: true }, val((patient as any).emergencyContact?.relation || (patient as any).emergencyRelation)],
      [{ text: 'Admission Date', bold: true }, dt((patient as any).admissionDate)],
      [{ text: 'Reason for Admission', bold: true }, val((patient as any).reasonForAdmission || (patient as any).reason)],
      [{ text: 'Primary Care Provider', bold: true }, val((patient as any).primaryCareProvider)],
      [{ text: 'Referring Provider', bold: true }, val((patient as any).referringProvider)],
      [{ text: 'Preferred Pharmacy', bold: true }, val((patient as any).preferredPharmacy)],
      [{ text: 'Code Status', bold: true }, val((patient as any).codeStatus)],
      [{ text: 'Height (cm)', bold: true }, val((patient as any).heightCm)],
      [{ text: 'Weight (kg)', bold: true }, val((patient as any).weightKg)],
      [{ text: 'Allergies', bold: true }, Array.isArray((patient as any).allergies) ? (patient as any).allergies.join(', ') : ((patient as any).allergies ?? '—')],
      [{ text: 'Diagnoses', bold: true }, Array.isArray((patient as any).diagnoses) ? (patient as any).diagnoses.join(', ') : ((patient as any).diagnoses ?? '—')],
      [{ text: 'Insurance', bold: true }, [val((patient as any).insuranceProvider), val((patient as any).insuranceId)].filter(Boolean).join('  •  ') || '—'],
      [{ text: 'Payor / Policy', bold: true }, [val((patient as any).payor), val((patient as any).policyHolder), val((patient as any).groupNumber)].filter(Boolean).join('  •  ') || '—'],
      [{ text: 'Occupation', bold: true }, val((patient as any).occupation)]
    ]);

    const medsRows = (prescriptions || []).map(r => [
      val((r as any).name), val((r as any).dose), val((r as any).route), val((r as any).frequency),
      [val((r as any).medicationType), val((r as any).medicationForm)].filter(Boolean).join(' / ') || '—',
      val((r as any).prescriber)
    ]);

    const medsTable = tableN(
      ['Medication', 'Dose', 'Route', 'Frequency', 'Type/Form', 'Prescriber'],
      medsRows.length ? medsRows : [['—','—','—','—','—','—']],
      ['*','auto','auto','auto','auto','auto']
    );

    const latestAssess = (assessments || [])
      .sort((a,b) => +new Date((b as any)?.createdAt?.toDate?.() ?? (b as any)?.createdAt ?? 0) - +new Date((a as any)?.createdAt?.toDate?.() ?? (a as any)?.createdAt ?? 0))
      .slice(0, 6)
      .map(a => [val((a as any).program), val((a as any).status || '—'), dt((a as any).assessedAt), (typeof (a as any).score === 'number' ? (a as any).score : '—')]);

    const assessTable = tableN(
      ['Program', 'Status', 'Assessed At', 'Score'],
      latestAssess.length ? latestAssess : [['—','—','—','—']]
    );

    const openTasks = (tasks || [])
      .filter(t => !(t as any).completed)
      .sort((a,b) => +new Date((a as any)?.dueAt?.toDate?.() ?? (a as any)?.dueAt ?? 0) - +new Date((b as any)?.dueAt?.toDate?.() ?? (b as any)?.dueAt ?? 0))
      .slice(0, 8)
      .map(t => [val((t as any).type), val((t as any).title), dt((t as any).dueAt), val((t as any).details)]);

    const taskTable = tableN(
      ['Type', 'Title', 'Due', 'Details'],
      openTasks.length ? openTasks : [['—','—','—','—']]
    );

    return {
      content: [
        ...headerBlock,
        section('PATIENT INFORMATION'),
        patientInfo,
        section('MEDICATIONS'),
        medsTable,
        section('ASSESSMENTS (Latest)'),
        assessTable,
        section('OPEN NURSE TASKS'),
        taskTable
      ],
      styles: {
        h1: { fontSize: 18, bold: true },
        h2: { fontSize: 12, bold: true }
      },
      defaultStyle: { font: 'Fallback', fontSize: 10 },
      footer: (currentPage: number, pageCount: number) =>
        ({ text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', margin: [0,10,20,0], fontSize: 9 })
    };
  }

  private dischargeDocDefHome(patient: Patient, prescriptions: Rx[], assessments: Assessment[]) {
    const val = (x: any, d: any = '—') => (x ?? d);
    const dt  = (x: any) => this.fmtDate(x);
    const section = (t: string) => ({ text: t, style: 'h2', margin: [0, 12, 0, 6] });

    const twoCol = (rows: any[][]) => ({
      table: { widths: ['*','*'], body: rows },
      layout: 'lightHorizontalLines'
    });

    const meds = (prescriptions || []).map(r => [
      val((r as any).name), val((r as any).dose), val((r as any).route), val((r as any).frequency)
    ]);

    const assessRows = (assessments || [])
      .sort((a,b) => +new Date((a as any)?.createdAt?.toDate?.() ?? (a as any)?.createdAt ?? 0) - +new Date((b as any)?.createdAt?.toDate?.() ?? (b as any)?.createdAt ?? 0))
      .slice(-10)
      .map(a => [val((a as any).program), val((a as any).status || '—'), dt((a as any).assessedAt), (typeof (a as any).score === 'number' ? (a as any).score : '—')]);

    return {
      content: [
        { text: 'PERRY HOME WOUND CARE • DISCHARGE SUMMARY', style: 'h1', color: 'black' },
        twoCol([
          [{ text: 'Patient', bold: true }, val((patient as any).name)],
          [{ text: 'DOB', bold: true }, dt((patient as any).dob)],
          [{ text: 'Phone', bold: true }, val((patient as any).phone)],
          [{ text: 'Address', bold: true }, [val((patient as any).address), val((patient as any).city), val((patient as any).state), val((patient as any).zip)].filter(Boolean).join(', ') || '—'],
          [{ text: 'Emergency Contact', bold: true }, val((patient as any).emergencyContact?.name || (patient as any).emergencyContactName)],
          [{ text: 'Admission Date', bold: true }, dt((patient as any).admissionDate)],
        ]),

        section('PRESCRIPTIONS AT DISCHARGE'),
        {
          table: {
            headerRows: 1, widths: ['*','auto','auto','auto'],
            body: [['Medication', 'Dose', 'Route', 'Frequency'],
              ...(meds.length ? meds : [['—','—','—','—']])]
          },
          layout: 'lightHorizontalLines'
        },

        section('ASSESSMENT HISTORY (Recent)'),
        {
          table: {
            headerRows: 1, widths: ['*','auto','auto','auto'],
            body: [['Program','Status','Assessed At','Score'],
              ...(assessRows.length ? assessRows : [['—','—','—','—']])]
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: { h1: { fontSize: 18, bold: true }, h2: { fontSize: 13, bold: true } },
      defaultStyle: { font: 'Fallback', fontSize: 10 },
      footer: (currentPage: number, pageCount: number) =>
        ({ text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', margin: [0,10,20,0], fontSize: 9 })
    };
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

  // ===================== Back-compat for old components =====================

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
  async viewAssessment(id: string) {
    const uid = await this.requireUid();
    return this.getAssessment(uid, id);
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
