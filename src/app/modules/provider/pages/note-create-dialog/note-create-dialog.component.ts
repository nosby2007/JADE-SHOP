import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import firebase from 'firebase/compat/app';
import { ProviderNoteService } from '../../Service/provider-note.service';
import { ProviderNote } from 'src/app/models/global.model';


type DialogData = { patientId: string };

@Component({
  selector: 'app-note-create-dialog',
  templateUrl: './note-create-dialog.component.html',
  styleUrls: ['./note-create-dialog.component.scss']
})
export class NoteCreateDialogComponent {
  saving = false;

  form = this.fb.group({
      type: this.fb.control<ProviderNote['type']>('Progress Notes', { nonNullable: true }),
    effectiveAt: [new Date(), Validators.required],
    dateOfService: [new Date(), Validators.required],
    visitType: ['Follow Up'],
    details: ['', Validators.required],
    providerName: ['']
  });

  types = ['Progress Notes', 'Consult', 'Follow Up', 'Discharge', 'Other'];

  constructor(
    private fb: FormBuilder,
    private svc: ProviderNoteService,
    private dlg: MatDialogRef<NoteCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

async save() {
  if (this.form.invalid) return;
  this.saving = true;

  const v = this.form.value as any;
  const toTs = (d: any) =>
    d?.toDate ? d : firebase.firestore.Timestamp.fromDate(new Date(d));

  try {
    await this.svc.create(this.data.patientId, {
      type: v.type as ProviderNote['type'],                         // 'Progress Notes' | 'Consult' | ...
      effectiveAt: toTs(v.effectiveAt),
      dateOfService: toTs(v.dateOfService),
      visitType: (v.visitType || 'Follow Up') as ProviderNote['visitType'],
      details: v.details as string,
      providerName: v.providerName || undefined,
      // createdBy/createdAt/updatedAt/patientId added in the service
    });
    this.dlg.close(true);
  } finally {
    this.saving = false;
  }
}


  close() { this.dlg.close(); }
}
