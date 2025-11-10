import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import firebase from 'firebase/compat/app';

import { LabReport, LabResultDetail, LabStatus } from 'src/app/models/global.model';
import { LabService } from '../../Service/labs.service';
import { AbstractControl } from '@angular/forms';

type DialogData = {
  patientId: string;
  report?: LabReport & { id?: string };
};

@Component({
  selector: 'app-lab-order-dialog',
  templateUrl: './lab-order-dialog.component.html',
  styleUrls: ['./lab-order-dialog.component.scss'],
})
export class LabOrderDialogComponent {
  loading = false;
  uploadedFile?: File;

  // --- Main form (aligns to your LabReport model) ---
  form = this.fb.group({
    // header
    reportName: [''],
    orderingProvider: [''],
    reportingLab: [''],
    attendingProvider: [''],
    admittingProvider: [''],
    ccList: [''],
    performingLab: [''],
    orderNumber: [''],
    orderNotes: [''],
    category: [''],

    // status
    flag: ['Unknown'],
    status: ['New' as LabStatus],

    // dates
    collectionDate: [null as any],
    receivedDate: [null as any],
    reportedDate: [null as any],

    // specimen
    specimenNumber: [''],
    specimenSource: ['Unknown'],
    specimenSiteModifier: [''],
    collectionVolume: [''],
    containersCount: [''],

    // results (preferred)
    results: this.fb.array<FormGroup<{
      panel: FormControl<string | null>;
      testName: FormControl<string | null>;
      result: FormControl<string | null>;
      units: FormControl<string | null>;
      refRange: FormControl<string | null>;
      flag: FormControl<string | null>;
      status: FormControl<string | null>;
    }>>([]),

    // legacy arrays (optional, some of your screens used them)
    testName: this.fb.array<FormControl<string | null>>([]),
    result: this.fb.array<FormControl<string | null>>([]),

    // notes & files
    notes: [''],
    fileName: [''],
    fileURL: [''],
    attachments: this.fb.array<FormGroup<{ name: FormControl<string | null>, url: FormControl<string | null> }>>([]),
  });

  constructor(
    private fb: FormBuilder,
    private svc: LabService,
    public dialogRef: MatDialogRef<LabOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    // Seed default one row so the UI shows something
    if (!this.resultsFA.length) this.addResultRow();

    // If editing, patch values
    if (data?.report) {
      const r = data.report;

      // patch scalars
      this.form.patchValue({
        reportName: r.reportName || '',
        orderingProvider: r.orderingProvider || '',
        reportingLab: r.reportingLab || '',
        attendingProvider: r.attendingProvider || '',
        admittingProvider: r.admittingProvider || '',
        ccList: r.ccList || '',
        performingLab: r.performingLab || '',
        orderNumber: r.orderNumber || '',
        orderNotes: r.orderNotes || '',
        category: r.category || '',
        flag: r.flag || 'Unknown',
        status: r.status || 'New',
        collectionDate: this.asDate(r.collectionDate),
        receivedDate: this.asDate(r.receivedDate),
        reportedDate: this.asDate(r.reportedDate),
        specimenNumber: r.specimenNumber || '',
        specimenSource: (r.specimenSource as any) || 'Unknown',
        specimenSiteModifier: r.specimenSiteModifier || '',
        collectionVolume: r.collectionVolume || '',
        containersCount: r.containersCount || '',
        notes: r.notes || '',
        fileName: r.fileName || '',
        fileURL: r.fileURL || '',
      });

      // patch results[] if any
      if (Array.isArray(r.results) && r.results.length) {
        this.resultsFA.clear();
        r.results.forEach(x => this.resultsFA.push(this.buildResultRow(x)));
      }

      // patch legacy arrays if present
      const tn = Array.isArray(r.testName) ? r.testName : [];
      const rs = Array.isArray(r.result) ? r.result : [];
      if (tn.length || rs.length) {
        this.testNameFA.clear();
        this.resultFA.clear();
        const max = Math.max(tn.length, rs.length);
        for (let i = 0; i < max; i++) {
          this.testNameFA.push(new FormControl<string | null>(tn[i] ?? null));
          this.resultFA.push(new FormControl<string | null>(rs[i] ?? null));
        }
        if (!max) {
          this.addTestRow();
        }
      } else if (!this.testNameFA.length && !this.resultFA.length) {
        // ensure at least one legacy row if UI section is visible
        this.addTestRow();
      }

      // attachments
      if (Array.isArray(r.attachments)) {
        r.attachments.forEach(a => {
          if (typeof a === 'string') {
            this.attachmentsFA.push(this.buildAttachmentRow({ name: null, url: a }));
          } else if (a && (a as any).url) {
            const x = a as any;
            this.attachmentsFA.push(this.buildAttachmentRow({ name: x.name ?? null, url: x.url ?? null }));
          }
        });
      }
    }
  }

  // ---------------- Helpers ----------------

  private buildResultRow(v?: Partial<LabResultDetail>) {
    return this.fb.group({
      panel: new FormControl<string | null>(v?.panel ?? null),
      testName: new FormControl<string | null>(v?.testName ?? null, { nonNullable: false, validators: [] }),
      result: new FormControl<string | null>(v?.result ?? null),
      units: new FormControl<string | null>(v?.units ?? null),
      refRange: new FormControl<string | null>(v?.refRange ?? null),
      flag: new FormControl<string | null>((v?.flag as any) ?? null),
      status: new FormControl<string | null>((v?.status as any) ?? null),
    });
  }

  private buildAttachmentRow(v?: { name: string | null, url: string | null }) {
    return this.fb.group({
      name: new FormControl<string | null>(v?.name ?? null),
      url: new FormControl<string | null>(v?.url ?? null),
    });
  }

  asDate(v: any): Date | null {
    if (!v) return null;
    if (v?.toDate) return v.toDate();
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }

  private toTsOrUndef(v: any): firebase.firestore.Timestamp | undefined {
    if (!v) return undefined;
    if (v?.toDate) return v as firebase.firestore.Timestamp;
    const d = new Date(v);
    return isNaN(+d) ? undefined : firebase.firestore.Timestamp.fromDate(d);
  }

  private clean<T>(obj: T): T {
    const walk = (x: any): any => {
      if (Array.isArray(x)) return x.map(walk).filter(y => y !== undefined && y !== null && y !== '');
      if (x && typeof x === 'object') {
        const out: any = {};
        Object.entries(x).forEach(([k, v]) => {
          const vv = walk(v);
          if (vv !== undefined && vv !== null && vv !== '') out[k] = vv;
        });
        return out;
      }
      return x;
    };
    return walk(obj);
  }

  // ---------------- Getters for template ----------------

  get resultsFA(): FormArray {
    return this.form.get('results') as FormArray;
  }

  get testNameFA(): FormArray {
    return this.form.get('testName') as FormArray;
  }

  get resultFA(): FormArray {
    return this.form.get('result') as FormArray;
  }

  get attachmentsFA(): FormArray {
    return this.form.get('attachments') as FormArray;
  }

  // ---------------- Rows controls ----------------

  addResultRow() {
    this.resultsFA.push(this.buildResultRow());
  }

  removeResultRow(i: number) {
    this.resultsFA.removeAt(i);
  }

  addTestRow() {
    this.testNameFA.push(new FormControl<string | null>(null));
    this.resultFA.push(new FormControl<string | null>(null));
  }

  removeTestRow(i: number) {
    this.testNameFA.removeAt(i);
    this.resultFA.removeAt(i);
  }

  // ---------------- File / attachments ----------------

  async onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    this.uploadedFile = file;

    // upload to Storage and add to attachments list
    const info = await this.svc.uploadAttachment(this.data.patientId, file);
    // Primary file
    this.form.patchValue({ fileURL: info.url, fileName: info.name });
    // Also push to attachments
    this.attachmentsFA.push(this.buildAttachmentRow({ name: info.name, url: info.url }));
  }

  removeAttachment(i: number) {
    this.attachmentsFA.removeAt(i);
  }

  // ---------------- Save ----------------

 async save() {
  if (!this.data?.patientId) {
    alert('Missing patientId');
    return;
  }
  this.loading = true;

  try {
    const user = firebase.auth().currentUser;
    if (!user?.uid) throw new Error('User not authenticated');

    const f = this.form.value;
    const isEdit = !!this.data.report?.id;

    // Build results[] from either resultsFA (preferred) or legacy arrays
    const fromResultsFA = (this.resultsFA.value as any[] || [])
      .map(x => ({
        panel: (x?.panel ?? '').trim(),
        testName: (x?.testName ?? '').trim(),
        result: (x?.result ?? '').trim(),
        units: (x?.units ?? '').trim(),
        refRange: (x?.refRange ?? '').trim(),
        flag: (x?.flag ?? '').trim(),
        status: (x?.status ?? '').trim(),
      }))
      // keep only rows with at least a testName or result
      .filter(r => r.testName || r.result);

    let results: LabResultDetail[] | undefined = undefined;

    if (fromResultsFA.length) {
      results = fromResultsFA;
    } else {
      // legacy arrays fallback
      const tn = (this.testNameFA.value as (string | null)[]) || [];
      const rs = (this.resultFA.value as (string | null)[]) || [];
      const max = Math.max(tn.length, rs.length);
      const out: LabResultDetail[] = [];
      for (let i = 0; i < max; i++) {
        const name = (tn[i] ?? '').trim();
        const val  = (rs[i] ?? '').trim();
        if (name || val) out.push({ testName: name, result: val });
      }
      if (out.length) results = out;
    }

    // helper: convert to TS or drop if invalid
    const toTs = (v: any): firebase.firestore.Timestamp | undefined => {
      if (!v) return undefined;
      if (v?.toDate) return v as firebase.firestore.Timestamp;
      const d = new Date(v);
      return isNaN(+d) ? undefined : firebase.firestore.Timestamp.fromDate(d);
    };

    // sanitize (remove null/undefined/empty string; drop empty objects; drop empty arrays)
    const clean = (x: any): any => {
      if (Array.isArray(x)) {
        const arr = x.map(clean).filter(v =>
          v !== undefined && v !== null &&
          !(typeof v === 'string' && v.trim() === '') &&
          !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
        );
        return arr.length ? arr : undefined;
      }
      if (x && typeof x === 'object') {
        const o: any = {};
        Object.entries(x).forEach(([k, v]) => {
          const cv = clean(v);
          if (
            cv !== undefined &&
            cv !== null &&
            !(typeof cv === 'string' && cv.trim() === '')
          ) {
            o[k] = cv;
          }
        });
        return Object.keys(o).length ? o : undefined;
      }
      if (typeof x === 'string') return x.trim();
      return x;
    };

    // Build payload common fields
    const basePayload: Partial<LabReport> = clean({
      reportName: f.reportName,
      orderingProvider: f.orderingProvider,
      reportingLab: f.reportingLab,
      attendingProvider: f.attendingProvider,
      admittingProvider: f.admittingProvider,
      ccList: f.ccList,
      performingLab: f.performingLab,
      orderNumber: f.orderNumber,
      orderNotes: f.orderNotes,
      category: f.category,
      flag: f.flag ?? 'Unknown',
      status: f.status ?? 'New',
      collectionDate: toTs(f.collectionDate),
      receivedDate: toTs(f.receivedDate),
      reportedDate: toTs(f.reportedDate),
      specimenNumber: f.specimenNumber,
      specimenSource: f.specimenSource,
      specimenSiteModifier: f.specimenSiteModifier,
      collectionVolume: f.collectionVolume,
      containersCount: f.containersCount,
      notes: f.notes,
      fileName: f.fileName,
      fileURL: f.fileURL,
      // results only if we actually have rows
      results: results && results.length ? results : undefined,
      // keep legacy arrays too if they have content
      testName: this.testNameFA.length ? this.testNameFA.value : undefined,
      result: this.resultFA.length ? this.resultFA.value : undefined,
      attachments: (this.attachmentsFA.value || []).map((a: any) => ({
        name: a?.name ?? null,
        url:  a?.url ?? null
      })),
    });

    if (isEdit) {
      // ✅ UPDATE: do NOT send patientId/createdAt/createdBy — rules keep them immutable
      await this.svc.update(this.data.patientId, this.data.report!.id!, basePayload);
    } else {
      // ✅ CREATE: send immutable core fields on first write
      const createPayload: Partial<LabReport> = {
        ...basePayload,
        patientId: this.data.patientId,                      // required by rules
        createdBy: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      await this.svc.create(this.data.patientId, createPayload);
    }

    this.dialogRef.close(true);
  } catch (e: any) {
    console.error('Save failed:', e);
    alert('Failed to save lab report: ' + (e?.message || e));
  } finally {
    this.loading = false;
  }
}


  // Strongly-typed accessors for template
testNameAt(i: number): FormControl<string | null> {
  return this.testNameFA.at(i) as FormControl<string | null>;
}
resultAt(i: number): FormControl<string | null> {
  return this.resultFA.at(i) as FormControl<string | null>;
}

  cancel() {
    this.dialogRef.close();
  }
}
