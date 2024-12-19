import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';

@Component({
  selector: 'app-laboratory-modal',
  templateUrl: './laboratory-modal.component.html',
  styleUrls: ['./laboratory-modal.component.scss']
})
export class LaboratoryModalComponent  {
  laboratoryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PharmacyModalComponent>,
    private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    this.laboratoryForm= this.fb.group({
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
    if (this.laboratoryForm.valid) {
      console.log('Données à sauvegarder :', this.laboratoryForm.value); // Debug
      this.dialogRef.close(this.laboratoryForm.value);
    } else {
      console.error('Formulaire invalide :', this.laboratoryForm.errors);
    }
  }
  

  close(): void {
    this.dialogRef.close();
  }
}