import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';

@Component({
  selector: 'app-diagnostic-modal',
  templateUrl: './diagnostic-modal.component.html',
  styleUrls: ['./diagnostic-modal.component.scss']
})
export class DiagnosticModalComponent {

  DiagtnosticForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PharmacyModalComponent>,
    private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    this.DiagtnosticForm= this.fb.group({
      date: [new Date(), Validators.required],
      time: ['', Validators.required],
      prescriber: ['', Validators.required],
      type: ['', Validators.required],
      method: ['', Validators.required],
      routine: ['', Validators.required],
      category: ['', Validators.required],
    });
  }

 

  savePrescription(): void {
    if (this.DiagtnosticForm.valid) {
      console.log('Données à sauvegarder :', this.DiagtnosticForm.value); // Debug
      this.dialogRef.close(this.DiagtnosticForm.value);
    } else {
      console.error('Formulaire invalide :', this.DiagtnosticForm.errors);
    }
  }
  

  close(): void {
    this.dialogRef.close();
  }
}