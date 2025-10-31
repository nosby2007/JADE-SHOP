
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type NutritionRxResult = {
  date: string | Date | null;
  time: string | null;
  category: 'Nutrition';
  prescriber: string;
  description: string;
  method: 'Phone' | 'Verbal' | 'Written' | string;
  route: 'Oral' | 'Enteral tube' | 'Gastrointestinal tube' | 'Subcutaneous' | 'Intramuscular' | 'Other' | string;
  type: string | null;    // directive type
  frequency: string | null;
  scheduleType: 'daily' | 'every-x-days' | 'specific-days' | null;
  everyXDays?: number | null;
  monday?: boolean; tuesday?: boolean; wednesday?: boolean; thursday?: boolean;
  friday?: boolean; saturday?: boolean; sunday?: boolean;
  timeCode?: string | null;
  diagnosis?: string | null;
  instructions?: string | null;
  indications?: string | null;
  startDate: string | Date | null;
  endDate: string | Date | null;

  signerEmail: string;
  signerPassword: string;
  attest: boolean;
};

@Component({
  selector: 'app-nutrition-rx-dialog',
  templateUrl: './nutrition-rx-dialog.component.html',
  styleUrls: ['./nutrition-rx-dialog.component.scss']
})
export class NutritionRxDialogComponent {
  nutritionForm: FormGroup;
  selectedScheduleType: 'daily' | 'every-x-days' | 'specific-days' | null = null;
  hidePw = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string; prefillEmail?: string },
    private fb: FormBuilder,
    private ref: MatDialogRef<NutritionRxDialogComponent>
  ) {
    this.nutritionForm = this.fb.group({
      date: [null, Validators.required],
      time: [null, Validators.required],
      category: ['Nutrition', Validators.required],
      prescriber: [null, Validators.required],
      description: [null, Validators.required],
      method: [null, Validators.required],
      route: [null, Validators.required],
      type: [null, Validators.required],
      frequency: [null],
      scheduleType: [null],
      everyXDays: [null],
      monday: [false], tuesday: [false], wednesday: [false], thursday: [false],
      friday: [false], saturday: [false], sunday: [false],
      timeCode: [null],
      diagnosis: [null],
      instructions: [null],
      indications: [null],
      startDate: [null],
      endDate: [null],

      signerEmail: [data.prefillEmail || '', [Validators.required, Validators.email]],
      signerPassword: [null, Validators.required],
      attest: [false, Validators.requiredTrue]
    });
  }

  onScheduleTypeChange(v: 'daily' | 'every-x-days' | 'specific-days') {
    this.selectedScheduleType = v;
    if (v !== 'every-x-days') this.nutritionForm.patchValue({ everyXDays: null });
    if (v !== 'specific-days') {
      this.nutritionForm.patchValue({
        monday: false, tuesday: false, wednesday: false, thursday: false,
        friday: false, saturday: false, sunday: false
      });
    }
  }

  onCancel() { this.ref.close(); }
  onSave() {
    if (this.nutritionForm.invalid) return;
    const val: NutritionRxResult = this.nutritionForm.getRawValue();
    if (val.method === 'Téléphone') val.method = 'Phone';
    if (val.method === 'Verbale') val.method = 'Verbal';
    if (val.method === 'Ecrite') val.method = 'Written';
    this.ref.close(val);
  }
}

