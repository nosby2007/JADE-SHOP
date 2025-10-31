import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type LaboratoryRxResult = {
  date: string | Date | null;
  time: string | null;
  category: 'Laboratory';
  prescriber: string;
  description: string;   // free text
  method: 'Phone' | 'Verbal' | 'Written' | string;
  testType: string;      // NFS, Lipids, Urinalysis, etc.
  specimen: 'Urine' | 'Blood' | 'Stool' | 'Fluid' | string | null;

  scheduleType: 'daily' | 'every-x-days' | 'specific-days' | null;
  everyXDays?: number | null;
  monday?: boolean; tuesday?: boolean; wednesday?: boolean; thursday?: boolean;
  friday?: boolean; saturday?: boolean; sunday?: boolean;

  timeCode?: 'Morning' | 'Afternoon' | 'Evening' | string | null;
  diagnostique?: string | null;
  instructions?: string | null;
  indications?: string | null;
  startDate: string | Date | null;
  endDate: string | Date | null;

  signerEmail: string;
  signerPassword: string;
  attest: boolean;
};

@Component({
  selector: 'app-laboratory-rx-dialog',
  templateUrl: './laboratory-rx-dialog.component.html',
  styleUrls: ['./laboratory-rx-dialog.component.scss']
})
export class LaboratoryRxDialogComponent {
  laboratoryForm: FormGroup;
  selectedScheduleType: 'daily' | 'every-x-days' | 'specific-days' | null = null;
  hidePw = true;

  testTypes = [
    'Complete blood count','Lipid panel','Urinalysis','Serology',
    'Wound culture','PSA','HIV','Phosphorus','PCV','Other'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string; prefillEmail?: string },
    private fb: FormBuilder,
    private ref: MatDialogRef<LaboratoryRxDialogComponent>
  ) {
    this.laboratoryForm = this.fb.group({
      date: [null, Validators.required],
      time: [null, Validators.required],
      category: ['Laboratory', Validators.required],
      prescriber: [null, Validators.required],
      description: [null, Validators.required],
      method: [null, Validators.required],
      testType: [null, Validators.required],
      specimen: [null],

      scheduleType: [null],
      everyXDays: [null],
      monday: [false], tuesday: [false], wednesday: [false], thursday: [false],
      friday: [false], saturday: [false], sunday: [false],

      timeCode: [null],
      diagnostique: [null],
      instructions: [null],
      indications: [null],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],

      signerEmail: [data.prefillEmail || '', [Validators.required, Validators.email]],
      signerPassword: [null, Validators.required],
      attest: [false, Validators.requiredTrue]
    });
  }

  onScheduleTypeChange(v: 'daily' | 'every-x-days' | 'specific-days') {
    this.selectedScheduleType = v;
    if (v !== 'every-x-days') this.laboratoryForm.patchValue({ everyXDays: null });
    if (v !== 'specific-days') {
      this.laboratoryForm.patchValue({
        monday: false, tuesday: false, wednesday: false, thursday: false,
        friday: false, saturday: false, sunday: false
      });
    }
  }

  onCancel() { this.ref.close(); }
  onSave() {
    if (this.laboratoryForm.invalid) return;
    const val: LaboratoryRxResult = this.laboratoryForm.getRawValue();
    if (val.method === 'Téléphone') val.method = 'Phone';
    if (val.method === 'Verbale') val.method = 'Verbal';
    if (val.method === 'Ecrite') val.method = 'Written';
    // translate specimen values
    if (val.specimen === 'sang') val.specimen = 'Blood';
    if (val.specimen === 'urine') val.specimen = 'Urine';
    if (val.specimen === 'selles') val.specimen = 'Stool';
    if (val.specimen === 'fluide') val.specimen = 'Fluid';
    this.ref.close(val);
  }
}
