import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-emar-create-dialog',
  templateUrl: './emar-create-dialog.component.html',
  styleUrls: ['./emar-create-dialog.component.scss']
})
export class EmarCreateDialogComponent {
  loading = false;

  form = this.fb.group({
    name: ['', Validators.required],
    dose: ['', Validators.required],
    route: ['PO', Validators.required],
    frequency: ['BID', Validators.required],
    prn: [false],
    notes: ['']
  });

  routes = ['PO','IV','IM','SC','SL','Topical','Inhalation','Rectal','Vaginal','Otic','Ophthalmic'];
  freqs  = ['QD','BID','TID','QID','QHS','Q4H','Q6H','Q8H','Q12H','PRN'];

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<EmarCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string },
  ) {}

  async save() {
    if (this.form.invalid) return;
    this.loading = true;

    const payload = {
      patientId: this.data.patientId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...this.form.value
    };

    try {
      // await this.svc.createMed(this.data.patientId, payload);
      this.ref.close(true);
    } finally {
      this.loading = false;
    }
  }
}
