// src/app/modules/provider/pages/view-labs-dialog/view-labs-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LabReport } from 'src/app/models/global.model';

type DialogData = {
  patientId: string;
  patientName?: string;
  report: LabReport & { id?: string };
};

type Row = {
  panel?: string;
  testName: string;
  result?: string;
  units?: string;
  refRange?: string;
  flag?: string;
  status?: string;
};

@Component({
  selector: 'app-view-labs-dialog',
  templateUrl: './view-labs-dialog.component.html',
  styleUrls: ['./view-labs-dialog.component.scss'],
})
export class ViewLabsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewLabsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  get r(): LabReport {
    return (this.data?.report as LabReport) || ({} as LabReport);
  }

  get rows(): Row[] {
    const rep = this.r;
    // Prefer structured results[]
    if (Array.isArray(rep.results) && rep.results.length) {
      return rep.results.map(x => ({
        panel: x.panel ?? '',
        testName: x.testName ?? '',
        result: x.result ?? '',
        units: x.units ?? '',
        refRange: x.refRange ?? '',
        flag: x.flag ?? undefined,
        status: x.status ?? undefined
      }));
    }
    // Legacy arrays fallback
    const names = Array.isArray(rep.testName) ? rep.testName : [];
    const results = Array.isArray(rep.result) ? rep.result : [];
    const max = Math.max(names.length, results.length);
    const out: Row[] = [];
    for (let i = 0; i < max; i++) {
      out.push({ testName: names[i] ?? '', result: results[i] ?? '' });
    }
    return out;
  }

  asDate(v: any): Date | null {
    if (!v) return null;
    if (v?.toDate) return v.toDate();
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }

  chipColor(kind: 'flag' | 'status'): 'primary' | 'accent' | 'warn' | undefined {
    const val = (kind === 'flag' ? (this.r.flag || 'Unknown') : (this.r.status || 'New')) as string;
    if (kind === 'flag') {
      switch (val) {
        case 'Critical': return 'warn';
        case 'High': return 'accent';
        case 'Low': return 'primary';
        case 'Normal': return 'primary';
        default: return undefined;
      }
    }
    switch (val) {
      case 'Final':
      case 'Completed': return 'primary';
      case 'Corrected':
      case 'Amended': return 'accent';
      default: return undefined;
    }
  }

  hasAnyAttachments(): boolean {
    return !!(this.r.fileURL || (Array.isArray(this.r.attachments) && this.r.attachments.length));
  }

  attachmentList(): { name: string; url: string }[] {
    const out: { name: string; url: string }[] = [];
    if (this.r.fileURL) out.push({ name: this.r.fileName || 'Attachment', url: this.r.fileURL });
    if (Array.isArray(this.r.attachments)) {
      this.r.attachments.forEach((u, idx) => {
        if (typeof u === 'string') out.push({ name: `Attachment ${idx + 1}`, url: u });
        else if (u && (u as any).url) {
          const x = u as any;
          out.push({ name: x.name || `Attachment ${idx + 1}`, url: x.url });
        }
      });
    }
    return out;
  }

  open(url: string) {
    if (!url) return;
    window.open(url, '_blank');
  }
  // Normalize anything (Firestore Timestamp | Date | string | null) → Date | null
toJsDate(v: any): Date | null {
  if (!v) return null;
  if (v.toDate && typeof v.toDate === 'function') return v.toDate(); // Firestore Timestamp
  const d = new Date(v);
  return isNaN(+d) ? null : d;
}

// Accessors that safely read the fields (keeps template simple)
getCollection(r: LabReport): any { return r?.collectionDate ?? null; }
getReceived(r: LabReport): any   { return r?.receivedDate ?? null; }
getReported(r: LabReport): any   { return r?.reportedDate ?? null; }


// Prefer explicit dates; otherwise fall back to created/updated
get collectionDate(): Date | null {
  return this.toJsDate(this.r?.collectionDate) ??
         this.toJsDate(this.r?.createdAt);
}

get receivedDate(): Date | null {
  return this.toJsDate(this.r?.receivedDate) ??
         this.toJsDate(this.r?.updatedAt);
}

get reportedDate(): Date | null {
  // Only fall back to updatedAt if the report looks “done”
  const explicit = this.toJsDate(this.r?.reportedDate);
  if (explicit) return explicit;
  const status = (this.r?.status || '').toLowerCase();
  const isFinal = ['final','completed','corrected','amended'].includes(status);
  return isFinal ? this.toJsDate(this.r?.updatedAt) : null;
}

}
