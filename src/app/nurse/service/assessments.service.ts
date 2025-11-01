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

  /**
   * Centered, margin-safe header block:
   * - One-row table, widths [200, 80, 220] -> total 500 < default 515 content width
   * - alignment: 'center' keeps it centered within the page content
   * - Right column uses left alignment (inside the centered table) to avoid clipping
   */
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
          widths: [200, 80, 220], // total 500 (fits inside default 515 content width)
          body: [[
            { stack: leftCol, border: [false, false, false, false] },
            { image: 'clinicLogo', width: 64, alignment: 'center', border: [false, false, false, false] },
            { stack: rightCol, border: [false, false, false, false] }
          ]]
        },
        layout: 'noBorders',
        alignment: 'center',   // centers the 500px table within page content
        margin: [0, 0, 0, 6]
      },
      // separator line (full content width is OK and visually clean)
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

  async addAssessment(
    pid: string,
    data: Partial<Assessment> & { program: Assessment['program'] }
  ) {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const fsPayload: any = {
      ...asObj(data),
      patientId: pid,
      createdBy: this.uid,
      createdAt: now,
      updatedAt: now,
      status: data.status || 'submitted'
    };

    const ref = await this.afs.collection(`patients/${pid}/assessments`).add(fsPayload);
    const id = ref.id;

    const pdfBlob = await this.makeAssessmentPdfBlob(pid, { ...fsPayload, id } as Assessment);
    const path = `patients/${pid}/assessments/${id}.pdf`;
    const task = await this.storage.upload(path, pdfBlob, { contentType: 'application/pdf' });
    const pdfUrl = await task.ref.getDownloadURL();
    await this.afs.doc(`patients/${pid}/assessments/${id}`).update({ pdfUrl });

    return id;
  }

  // ===================== Compilations (PDFs) =====================

  async compileAdmission(pid: string) {
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
    const task = await this.storage.upload(path, blob, { contentType: 'application/pdf' });
    return await task.ref.getDownloadURL();
  }

  async compileDischarge(pid: string) {
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
    const task = await this.storage.upload(path, blob, { contentType: 'application/pdf' });
    return await task.ref.getDownloadURL();
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
    const header = { text: `Assessment: ${a.program}`, style: 'h1', color: 'black', bold: true, textAlign: 'center', textDecoration: 'underline' };
    const meta = { text: `Assessed: ${this.fmtDate(a.assessedAt)} • Status: ${a.status || '—'}`, margin:[0,0,0,8] };
    const body: any[] = [header, meta];

    if (a.answers && typeof a.answers === 'object') {
      const rows = Object.entries(a.answers).map(([k, v]) => [
        { text: String(k), bold: true },
        (typeof v === 'object' ? JSON.stringify(v, null, 0) : String(v ?? '—'))
      ]);
      body.push({
        table: { widths: ['*','*'], body: rows.length ? rows : [['No data','—']] },
        layout: 'lightHorizontalLines',
        margin: [0, 6, 0, 0]
      });
    } else {
      body.push({ text: 'No answers provided.', italics: true, margin:[0,6,0,0] });
    }

    if (typeof a.score === 'number') {
      body.push({ text: `Score: ${a.score}`, margin:[0,6,0,0] });
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
      { text: 'PERRY HOME WOUND CARE • ADMISSION RECORD', style: 'h1', color: 'blue',  bold: true, alignment: 'center',  margin: [0, 0, 0, 4] },
      { text: `${val(patient.name)} • Created: ${dt(patient.createdAt)} • Phone: ${val(patient.phone)}`, margin:[0,0,0,8] }
    ];

    const patientInfo = twoCol([
      [{ text: 'Name', bold: true }, val(patient.name)],
      [{ text: 'Preferred Name', bold: true }, val(patient.preferredName)],
      [{ text: 'Gender', bold: true }, val(patient.gender)],
      [{ text: 'Date of Birth', bold: true }, dt(patient.dob)],
      [{ text: 'Phone', bold: true }, val(patient.phone)],
      [{ text: 'Email', bold: true }, val(patient.email)],
      [{ text: 'Address', bold: true }, [val(patient.address), val(patient.address1), val(patient.address2), val(patient.city), val(patient.state), val(patient.zip)].filter(Boolean).join(', ') || '—'],
      [{ text: 'Admission Date', bold: true }, dt(patient.admissionDate)],
      
    ]);

    const medsRows = (prescriptions || []).map(r => [
      val(r.name), val(r.dose), val(r.route), val(r.frequency),
      [val(r.medicationType), val(r.medicationForm)].filter(Boolean).join(' / ') || '—',
      val(r.prescriber)
    ]);

    const medsTable = tableN(
      ['Medication', 'Dose', 'Route', 'Frequency', 'Type/Form', 'Prescriber'],
      medsRows.length ? medsRows : [['—','—','—','—','—','—']],
      ['*','auto','auto','auto','auto','auto']
    );

    const latestAssess = (assessments || [])
      .sort((a,b) => +new Date(b?.createdAt?.toDate?.() ?? b?.createdAt ?? 0) - +new Date(a?.createdAt?.toDate?.() ?? a?.createdAt ?? 0))
      .slice(0, 6)
      .map(a => [val(a.program), val(a.status || '—'), dt(a.assessedAt), (typeof a.score === 'number' ? a.score : '—')]);

    const assessTable = tableN(
      ['Program', 'Status', 'Assessed At', 'Score'],
      latestAssess.length ? latestAssess : [['—','—','—','—']]
    );

    const openTasks = (tasks || [])
      .filter(t => !t.completed)
      .sort((a,b) => +new Date(a?.dueAt?.toDate?.() ?? a?.dueAt ?? 0) - +new Date(b?.dueAt?.toDate?.() ?? b?.dueAt ?? 0))
      .slice(0, 8)
      .map(t => [val(t.type), val(t.title), dt(t.dueAt), val(t.details)]);

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
      val(r.name), val(r.dose), val(r.route), val(r.frequency)
    ]);

    const assessRows = (assessments || [])
      .sort((a,b) => +new Date(a?.createdAt?.toDate?.() ?? a?.createdAt ?? 0) - +new Date(b?.createdAt?.toDate?.() ?? b?.createdAt ?? 0))
      .slice(-10)
      .map(a => [val(a.program), val(a.status || '—'), dt(a.assessedAt), (typeof a.score === 'number' ? a.score : '—')]);

    return {
      content: [
        { text: 'PERRY HOME WOUND CARE • DISCHARGE SUMMARY', style: 'h1', color: 'blue',  bold: true, textAlign: 'center', },
        twoCol([
          [{ text: 'Patient', bold: true }, val(patient.name)],
          [{ text: 'DOB', bold: true }, dt(patient.dob)],
          [{ text: 'Phone', bold: true }, val(patient.phone)],
          [{ text: 'Address', bold: true }, [val(patient.address), val(patient.city), val(patient.state), val(patient.zip)].filter(Boolean).join(', ') || '—'],
          [{ text: 'Emergency Contact', bold: true }, val(patient.emergencyContact?.name || patient.emergencyContactName)],
          [{ text: 'Admission Date', bold: true }, dt(patient.admissionDate)],
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
    return kind === 'braden' ? 'Braden' : 'Wound';
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
      data?.bradenDate ??
      data?.visitDate ??
      data?.measuredAt ??
      new Date();

    const { type: _drop, ...answers } = (data ?? {});
    if (esign) (answers as any).eSignature = esign;

    const shaped = {
      program,
      assessedAt,
      status: (typeof data?.status === 'string' ? data.status : 'submitted'),
      score: (typeof data?.score === 'number' ? data.score : undefined),
      kind,
      answers
    } as Partial<Assessment> & { program: 'Braden'|'FallRisk'|'Nutrition'|'Wound' };

    return this.addAssessment(pid, shaped);
  }
}
