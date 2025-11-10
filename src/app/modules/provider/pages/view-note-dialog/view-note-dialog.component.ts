import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

import { ProviderNote } from 'src/app/models/global.model';
import { NurseDataService } from 'src/app/nurse/service/nurse-data.service';

export interface ViewNoteDialogData {
  patientId: string;
  patientName?: string;   // optional fast-path (if caller already has it)
  note: ProviderNote & { id?: string };
}

@Component({
  selector: 'app-view-note-dialog',
  templateUrl: './view-note-dialog.component.html',
  styleUrls: ['./view-note-dialog.component.scss'],
})
export class ViewNoteDialogComponent {
  patientName$: Observable<string>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ViewNoteDialogData,
    private dlgRef: MatDialogRef<ViewNoteDialogComponent>,
    nurse: NurseDataService
  ) {
    this.patientName$ = data.patientName
      ? of(data.patientName)
      : nurse.getPatient(data.patientId).pipe(map(p => p?.name ?? '—'));
  }

  close() { this.dlgRef.close(); }

  asDate(v: any): Date | null {
    if (!v) return null;
    if (v?.toDate) return (v as firebase.firestore.Timestamp).toDate();
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }

  // Optional: quick print
  print() { window.print(); }
}
