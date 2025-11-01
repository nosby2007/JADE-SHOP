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
      // If you land here, the global scripts weren't loaded (see angular.json or index.html CDN).
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
      createdAt: null,
      updatedAt: null,
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
    const [patSnap, assSnap, rxSnap, providersSnap, pharmacySnap, facilitiesSnap, contactsSnap, dxSnap] =
      await Promise.all([
        this.afs.doc(`patients/${pid}`).ref.get(),
        this.afs.collection(`patients/${pid}/assessments`).ref.get(),
        this.afs.collection(`patients/${pid}/prescriptions`).ref.get(),
        this.afs.collection(`patients/${pid}/careProviders`).ref.get(),      // ensure these collections exist
        this.afs.collection(`patients/${pid}/pharmacy`).ref.get(),
        this.afs.collection(`patients/${pid}/externalFacilities`).ref.get(),
        this.afs.collection(`patients/${pid}/contacts`).ref.get(),
        this.afs.collection(`patients/${pid}/diagnoses`).ref.get()
      ]);

    const patient = patSnap.data() || {};

    const assessments = assSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) })) as Assessment[];
    const prescriptions = rxSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) }));

    const providers = providersSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) }));
    const pharmacy  = pharmacySnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) }));
    const facilities= facilitiesSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) }));
    const contacts  = contactsSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) }));
    const diagnoses = dxSnap.docs.map(d => ({ id: d.id, ...asObj(d.data()) }));

    const docDef: any = this.admissionDocDef(
      patient, prescriptions, assessments,
      { providers, pharmacy, facilities, contacts, diagnoses }
    );

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
      // ... your existing Braden section ...
    } else if (a.type === 'skinWeekly') {
      // ... your existing Skin Weekly section ...
    } else if (a.type === 'pressureInjuryWeekly') {
      // ... your existing Pressure Injury Weekly section ...
    } else if (a.type === 'progressNote') {
      // ... your existing Progress Note section ...
    } else if (a.type === 'carePlan') {
      // ... your existing Care Plan section ...
    } else if (a.type === 'vitals') {          // example vitals layout
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

  // ================== Rich Admission Doc ==================
  private admissionDocDef(
    patient: any,
    prescriptions: any[],
    assessments: Assessment[],
    extra?: {
      providers?: any[],
      pharmacy?: any[],
      facilities?: any[],
      contacts?: any[],
      diagnoses?: any[],
    }
  ) {
    const providers = extra?.providers ?? [];
    const pharmacy  = extra?.pharmacy ?? [];
    const facilities= extra?.facilities ?? [];
    const contacts  = extra?.contacts ?? [];
    const diagnoses = extra?.diagnoses ?? [];

    // helpers
    const val = (x: any, d: any = '—') => (x ?? d);
    const yn  = (x: any) => (x === true ? 'Yes' : x === false ? 'No' : '—');
    const dt  = (x: any) => this.fmtDate(x);
    const sectionTitle = (t: string) => ({ text: t, style: 'h2', margin: [0, 12, 0, 6] });

    const kvRow = (k: string, v: any) => ([
      { text: k, style: 'cellH' }, val(v)
    ]);

    const table2col = (rows: any[][]) => ({
      table: { widths: ['*','*'], body: rows },
      layout: 'lightHorizontalLines'
    });

    const tableN = (headerRow: any[], rows: any[][], widths: any[] = []) => ({
      table: {
        headerRows: 1,
        widths: widths.length ? widths : Array(headerRow.length).fill('*'),
        body: [headerRow, ...rows]
      },
      layout: 'lightHorizontalLines'
    });

    // ---------- Header ----------
    const headerBlock = [
      { text: 'ADMISSION RECORD', style: 'h1' },
      { text: `${val(patient.name)}  •  Generated: ${dt(new Date())}`, margin: [0,0,0,8] }
    ];

    // ---------- Resident Information ----------
    const residentInfo = table2col([
      kvRow('Resident Name', val(patient.name)),
      kvRow('Preferred Name', val(patient.preferredName)),
      kvRow('Unit', val(patient.unit)),
      kvRow('Room / Bed', val(patient.roomBed)),
      kvRow('Admission Date', dt(patient.admissionDate)),
      kvRow('Initial Admission Date', dt(patient.initialAdmissionDate)),
      kvRow('Original Admission Date', dt(patient.originalAdmissionDate)),
      kvRow('Resident #', val(patient.residentNumber)),
      kvRow('Previous Address', val(patient.previousAddress)),
      kvRow('Previous Phone #', val(patient.previousPhone)),
      kvRow('Legal Mailing Address', val(patient.legalMailingAddress)),
      kvRow('Sex', val(patient.sex)),
      kvRow('Birthdate', dt(patient.dob)),
      kvRow('Age', val(patient.age)),
      kvRow('Marital Status', val(patient.maritalStatus)),
      kvRow('Religion', val(patient.religion)),
      kvRow('Race', val(patient.race)),
      kvRow('Occupation(s)', val(patient.occupation)),
      kvRow('Primary Language', val(patient.primaryLanguage)),
      kvRow('Admitted From', val(patient.admittedFrom)),
      kvRow('Admission Location', val(patient.admissionLocation)),
      kvRow('Birth Place', val(patient.birthPlace)),
      kvRow('Citizenship', val(patient.citizenship)),
      kvRow('Maiden Name', val(patient.maidenName)),
      kvRow('Medicare/HIC#', val(patient.medicareNumber)),
      kvRow('Medicaid #', val(patient.medicaidNumber)),
      kvRow('Insurance Policy #', val(patient.insurancePolicy)),
      kvRow('Part D Policy #', val(patient.partDPolicy)),
    ]);

    // ---------- Payer Information ----------
    const payerInfo = table2col([
      kvRow('Primary Payer', val(patient.primaryPayer)),
      kvRow('Policy #', val(patient.primaryPolicyNumber)),
      kvRow('Group #', val(patient.primaryGroup)),
      kvRow('Ins. Company', val(patient.primaryInsurer)),
      kvRow('Second Payer', val(patient.secondaryPayer)),
      kvRow('Secondary Policy #', val(patient.secondaryPolicyNumber)),
    ]);

    // ---------- Other Information ----------
    const otherInfo = table2col([
      kvRow('Most Recent Hospital Stay', val(patient.recentHospitalStay)),
      kvRow('Allergies', (patient.allergies?.length ? patient.allergies.join(', ') : 'No Known Allergies')),
      kvRow('GA Community Medicaid', val(patient.gaCommunityMedicaid)),
      kvRow('3 day qualifying stay?', yn(patient.qualifyingStay3d)),
      kvRow('Admission Agreement Completed', yn(patient.admissionAgreementCompleted)),
      kvRow('Admission Type', val(patient.admissionType)),
      kvRow('Authorized Rep for MA application', val(patient.maAuthorizedRep)),
      kvRow('Bed Hold Authorized?', yn(patient.bedHoldAuthorized)),
      kvRow('Business mail to RP', yn(patient.businessMailToRP)),
      kvRow('Co-Insurance', val(patient.coInsurance)),
      kvRow('Code Status', val(patient.codeStatus)),
      kvRow('Insurance Auth Number', val(patient.insAuthNumber)),
      kvRow('Days covered', val(patient.insDaysCovered)),
      kvRow('Insurance Case Manager', val(patient.insCaseManager)),
      kvRow('Insurance #2 Effective Date', dt(patient.ins2EffectiveDate)),
      kvRow('Insurance Address', val(patient.insAddress)), // fixed comma
      kvRow('Insurance Auth Number (Alt)', val(patient.insAuthNumber2)),
      kvRow('Med D Plan Effective Date', dt(patient.medDEffectiveDate)),
      kvRow('Med D Plan Name', val(patient.medDPlanName)),
      kvRow('Medicaid', val(patient.medicaidState)),
      kvRow('Medicaid caseworker', val(patient.medicaidCaseworker)),
      kvRow('Registered Voter', yn(patient.registeredVoter)),
    ]);

    // ---------- Prescriptions ----------
    const medsTable = tableN(
      ['Medication', 'Dose', 'Route', 'Freq'],
      (prescriptions || []).map(r => [val(r.name), val(r.dose), val(r.route), val(r.frequency)]),
      ['*','auto','auto','auto']
    );

    // ---------- Care Providers ----------
    const providersTable = tableN(
      ['Provider', 'Role', 'Phone', 'Address', 'NPI'],
      providers.map(p => [
        val(p.name),
        val(p.role || p.title),
        val(p.phone),
        val(p.address),
        val(p.npi || p.npiNumber)
      ])
    );

    // ---------- Pharmacy ----------
    const pharmacyTable = tableN(
      ['Pharmacy', 'Phone/Fax', 'Address', 'Primary Contact'],
      pharmacy.map(ph => [
        val(ph.name),
        [val(ph.phone), val(ph.fax)].filter(Boolean).join(' / '),
        val(ph.address),
        val(ph.primaryContact)
      ])
    );

    // ---------- External Facilities ----------
    const facilitiesTable = tableN(
      ['Facility Name', 'Phone', 'Type'],
      facilities.map(f => [val(f.name), val(f.phone), val(f.type)])
    );

    // ---------- Contacts ----------
    const contactsTable = tableN(
      ['Name', 'Contact Type', 'Relationship', 'Address', 'Phone/Email'],
      contacts.map(c => [
        val(c.name),
        val(c.contactType),
        val(c.relationship),
        val(c.address),
        [val(c.phone), val(c.email)].filter(Boolean).join(' • ')
      ])
    );

    // ---------- Diagnosis Information ----------
    const dxTable = tableN(
      ['Code', 'Description', 'Onset Date', 'Rank', 'Classification'],
      diagnoses.map(d => [val(d.code), val(d.description), dt(d.onsetDate), val(d.rank), val(d.classification)])
    );

    // ---------- Advance Directive ----------
    const advanceDirective = table2col([
      kvRow('Code Status', val(patient.codeStatus)),
      kvRow('Other Advanced Directives', val(patient.otherAdvanceDirectives)),
      kvRow('Discharged to', val(patient.dischargedTo)),
      kvRow('Date of Discharge', dt(patient.dateOfDischarge)),
    ]);

    // ---------- Miscellaneous Information ----------
    const miscInfo = table2col([
      kvRow('Length of Stay', val(patient.lengthOfStay)),
      kvRow('Personal Effects Sent With', val(patient.personalEffects)),
      kvRow('Signature', val(patient.signatureName)),
      kvRow('Signature Date', dt(patient.signatureDate)),
    ]);

    // ---------- Assessments (latest) ----------
    const assessList = (assessments || [])
      .sort((a, b) =>
        +new Date((b as any).createdAt?.toDate?.() ?? (b as any).createdAt ?? 0) -
        +new Date((a as any).createdAt?.toDate?.() ?? (a as any).createdAt ?? 0)
      )
      .slice(0, 8)
      .map(a => ({
        text: `${a.type} • ${this.fmtDate(a.createdAt)} • ${a.eSignature?.signerName || a.eSignature?.signerEmail || '—'}`
      }));

    return {
      content: [
        ...headerBlock,

        sectionTitle('RESIDENT INFORMATION'),
        residentInfo,

        sectionTitle('PAYER INFORMATION'),
        payerInfo,

        sectionTitle('OTHER INFORMATION'),
        otherInfo,

        sectionTitle('PRESCRIPTIONS'),
        (prescriptions?.length ? medsTable : { text: 'No prescriptions', italics: true }),

        sectionTitle('CARE PROVIDERS'),
        (providers?.length ? providersTable : { text: 'No providers on file', italics: true }),

        sectionTitle('PHARMACY'),
        (pharmacy?.length ? pharmacyTable : { text: 'No pharmacy on file', italics: true }),

        sectionTitle('EXTERNAL FACILITIES'),
        (facilities?.length ? facilitiesTable : { text: 'No facilities on file', italics: true }),

        sectionTitle('CONTACTS'),
        (contacts?.length ? contactsTable : { text: 'No contacts on file', italics: true }),

        sectionTitle('DIAGNOSIS INFORMATION'),
        (diagnoses?.length ? dxTable : { text: 'No diagnosis on file', italics: true }),

        sectionTitle('ADVANCE DIRECTIVE'),
        advanceDirective,

        sectionTitle('MISCELLANEOUS INFORMATION'),
        miscInfo,

        sectionTitle('ASSESSMENTS (Latest)'),
        ...(assessList.length ? assessList : [{ text: 'No assessments', italics: true }]),
      ],
      styles: {
        h1: { fontSize: 18, bold: true },
        h2: { fontSize: 12, bold: true },
        cellH: { bold: true, fillColor: '#f2f2f2' }
      },
      defaultStyle: { font: 'Fallback', fontSize: 10 },
      footer: (currentPage: number, pageCount: number) =>
        ({ text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', margin: [0,10,20,0], fontSize: 9 })
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
            body: [['Medication', 'Dose', 'Route', 'Freq'],
              ...prescriptions.map(r => [r.name || '—', r.dose || '—', r.route || '—', r.frequency || '—'])]
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
