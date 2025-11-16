// document-dialog.component.ts (only relevant diffs)
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientDocumentService, UploadOptions, PatientDocType } from '../document.service';

type Visibility = 'careTeam' | 'adminOnly' | 'patientAndTeam';

export interface DocumentDialogData {
  patientId?: string; // pass this when opening the dialog from a patient page
}

@Component({
  selector: 'app-document-dialog',
  templateUrl: './document-dialog.component.html',
  styleUrls: ['./document-dialog.component.scss']
})
export class DocumentDialogComponent {
  docTypes: { value: PatientDocType; label: string }[] = [
    { value: 'dischargeSummary', label: 'Discharge summary' },
    { value: 'assessment',       label: 'Assessment' },
    { value: 'treatmentPlan',    label: 'Treatment plan' },
    { value: 'consent',          label: 'Consent' },
    { value: 'labResult',        label: 'Lab result' },
    { value: 'rx',               label: 'Prescription (Rx)' },
    { value: 'billing',          label: 'Billing' },
    { value: 'other',            label: 'Other' },
  ];

  type: PatientDocType | '' = '';
  description = '';
  selectedFiles: File[] = [];
  isLoading = false;
  visibility: Visibility = 'careTeam';
  errorMsg = '';

  constructor(
    private dialogRef: MatDialogRef<DocumentDialogComponent>,
    private docService: PatientDocumentService,
    @Inject(MAT_DIALOG_DATA) public data: DocumentDialogData
  ) {}

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFiles = input?.files ? Array.from(input.files) : [];
  }
  clearSelection() { this.selectedFiles = []; }

  private toUploadVisibility(v: Visibility): UploadOptions['visibility'] {
    return v === 'adminOnly' ? 'private' : v;
  }

  async upload(): Promise<void> {
    this.errorMsg = '';
    if (!this.selectedFiles.length || !this.type) return;

    this.isLoading = true;
    try {
      const opts: UploadOptions = {
        type: this.type,
        description: this.description,
        visibility: this.toUploadVisibility(this.visibility)
      };

      if (this.data?.patientId) {
        await this.docService.uploadForPatient(this.data.patientId, this.selectedFiles, opts);
      } else {
        // optional: allow self-upload if you use patient portal
        await this.docService.uploadAsCurrentPatient(this.selectedFiles, opts);
      }

      this.dialogRef.close(true);
    } catch (e: any) {
      console.error(e);
      this.errorMsg = e?.message || 'Upload failed';
    } finally {
      this.isLoading = false;
    }
  }

  close() { this.dialogRef.close(false); }
}
