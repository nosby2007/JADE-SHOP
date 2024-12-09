import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-patient-uda-modal',
  templateUrl: './patient-uda-modal.component.html',
  styleUrls: ['./patient-uda-modal.component.scss']
})
export class PatientUdaModalComponent implements OnInit {
  assessmentForm: FormGroup;

  assessmentTypes: string[] = [
    'Nursing: Weekly Skin Evaluation - V2',
    'Nursing: Lift and Transfer Evaluation - V5',
    'Nursing: Wandering & Elopement Evaluation 2016 - V6',
    'Nursing: Daily Skilled / Managed Care / PAE Progress Note - V3.4 - V7',
    'Nursing: Bowel Incontinence Evaluation',
    'Protocol: Nursing Evaluation Respiratory Compromise (weekly) - V2.0 - V4',
    'Nursing: Pain Evaluation, Cognitively Intact - V4',
    'Nutrition: Dietary Manager Quarterly/Annual Review - V7',
    'Discharge Assessment/Discussion (Ongoing)',
    'CRC: GG Evaluation - V2',
    'Nursing: Fall Risk Evaluation - V5',
    'BRADEN SCALE FOR PREDICTING PRESSURE SORE RISK',
    'eINTERACT Transfer Form V5',
    'Social Services: Quarterly Review - V2'
  ];
existingSchedules: any;

  constructor(
    private dialogRef: MatDialogRef<PatientUdaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.assessmentForm = this.fb.group({
      assessmentDate: [new Date(), Validators.required],
      assessmentTime: ['', Validators.required],
      assessmentType: ['', Validators.required],
      assessmentCategory: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  save(): void {
    if (this.assessmentForm.valid) {
      console.log('Form Data:', this.assessmentForm.value);
      this.dialogRef.close(this.assessmentForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
