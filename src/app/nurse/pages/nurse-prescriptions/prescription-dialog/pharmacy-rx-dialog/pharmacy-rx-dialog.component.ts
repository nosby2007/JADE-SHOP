import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type PharmacyRxResult = {
  // header
  date: string | Date | null;
  time: string | null;
  category: 'Pharmacy';
  method: 'Phone' | 'Verbal' | 'Written' | string;
  prescriber: string;
  // pharmacy specifics
  medication: string;
  type: string | null; // class (Analgesic, Antibiotic, etc.)
  route: string | null;
  dose: string | null;
  frequency: string | null;
  scheduleType: 'daily' | 'every-x-days' | 'specific-days' | null;
  everyXDays?: number | null;
  monday?: boolean; tuesday?: boolean; wednesday?: boolean; thursday?: boolean;
  friday?: boolean; saturday?: boolean; sunday?: boolean;
  timeCode?: string | null;
  diagnosis?: string | null;
  instructions?: string | null; // posology
  indications?: string | null;
  startDate: string | Date | null;
  endDate: string | Date | null;
  notes?: string | null;

  // e-sign
  signerEmail: string;
  signerPassword: string;
  attest: boolean;
};

@Component({
  selector: 'app-pharmacy-rx-dialog',
  templateUrl: './pharmacy-rx-dialog.component.html',
  styleUrls: ['./pharmacy-rx-dialog.component.scss']
})
export class PharmacyRxDialogComponent {
  pharmacyForm: FormGroup;
  selectedScheduleType: 'daily' | 'every-x-days' | 'specific-days' | null = null;
  hidePw = true;

  medClasses = [
    'Analgesic','Antibiotic','Antidepressant','Anxiolytic','Anticoagulant',
    'Anticonvulsant','Sedative','Antidiabetic','Antipsychotic',
    'Cardiovascular','Diuretic','Nebulizer','Antimalarial','Antidiarrheal',
    'Antitussive','Lubricant'
  ];
  routes = [
    'Oral','Intravenous','Enteral','Subcutaneous','Intramuscular','Rectal',
    'Topical','Sublingual','Transdermal','Epidural injection','Gastrostomy tube',
    'Port','Implant','Irrigation','Infusion','Intravesical','Hemodialysis',
    'Both eyes','Left eye','Right eye','Left ear','Right ear','Peritoneal cavity'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string; prefillEmail?: string },
    private fb: FormBuilder,
    private ref: MatDialogRef<PharmacyRxDialogComponent>
  ) {
    this.pharmacyForm = this.fb.group({
      date: [null, Validators.required],
      time: [null, Validators.required],
      category: ['Pharmacy', Validators.required],
      method: [null, Validators.required],
      prescriber: [null, Validators.required],

      medication: [null, Validators.required],
      type: [null, Validators.required],
      route: [null, Validators.required],
      dose: [null],
      frequency: [null],
      scheduleType: [null],
      everyXDays: [null],
      monday: [false], tuesday: [false], wednesday: [false], thursday: [false],
      friday: [false], saturday: [false], sunday: [false],

      timeCode: [null],
      diagnosis: [null],
      instructions: [null],
      indications: [null],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      notes: [null],

      signerEmail: [data.prefillEmail || '', [Validators.required, Validators.email]],
      signerPassword: [null, Validators.required],
      attest: [false, Validators.requiredTrue]
    });
  }

  onScheduleTypeChange(v: 'daily' | 'every-x-days' | 'specific-days') {
    this.selectedScheduleType = v;
    if (v !== 'every-x-days') this.pharmacyForm.patchValue({ everyXDays: null });
    if (v !== 'specific-days') {
      this.pharmacyForm.patchValue({
        monday: false, tuesday: false, wednesday: false, thursday: false,
        friday: false, saturday: false, sunday: false
      });
    }
  }

  onCancel() { this.ref.close(); }
  validatePrescription() {
    if (this.pharmacyForm.invalid) return;
    const val: PharmacyRxResult = this.pharmacyForm.getRawValue();
    // normalize method to English
    if (val.method === 'Téléphone') val.method = 'Phone';
    if (val.method === 'Verbale') val.method = 'Verbal';
    if (val.method === 'Ecrite') val.method = 'Written';
    this.ref.close(val);
  }
}
