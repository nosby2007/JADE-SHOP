import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-emar-admin-dialog',
  templateUrl: './emar-admin-dialog.component.html',
  styleUrls: ['./emar-admin-dialog.component.scss']
})
export class EmarAdminDialogComponent {
  loading = false;

  form = this.fb.group({
    dateTime: [new Date(), Validators.required],
    doseGiven: ['', Validators.required],
    site: [''],
    route: ['PO', Validators.required],
    result: [''],
    held: [false],
    reasonHeld: [''],
    nurseSignature: ['', Validators.required]
  });

  routes = ['PO','IV','IM','SC','SL','Topical','Inhalation','Rectal','Vaginal','Otic','Ophthalmic'];

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<EmarAdminDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string; medId: string },
  ) {}

  async save() {
    if (this.form.invalid) return;
    this.loading = true;

    const payload = {
      patientId: this.data.patientId,
      medId: this.data.medId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...this.form.value
    };

    try {
      // await this.svc.createAdministration(this.data.patientId, this.data.medId, payload);
      this.ref.close(true);
    } finally {
      this.loading = false;
    }
  }
}
