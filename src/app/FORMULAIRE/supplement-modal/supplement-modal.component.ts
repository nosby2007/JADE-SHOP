import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';

@Component({
  selector: 'app-supplement-modal',
  templateUrl: './supplement-modal.component.html',
  styleUrls: ['./supplement-modal.component.scss']
})
export class SupplementModalComponent  {

  SuplementForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SupplementModalComponent>,
    private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    this.SuplementForm= this.fb.group({
      date: [new Date(), Validators.required],
    
      time: ['', Validators.required],
      route: ['', Validators.required],
      prescriber: ['', Validators.required],
      type: ['', Validators.required],
      method: ['', Validators.required],
      routine: ['', Validators.required],
      category: ['', Validators.required],
    });
  }

 

  savePrescription(): void {
    if (this.SuplementForm.valid) {
      console.log('Données à sauvegarder :', this.SuplementForm.value); // Debug
      this.dialogRef.close(this.SuplementForm.value);
    } else {
      console.error('Formulaire invalide :', this.SuplementForm.errors);
    }
  }
  

  close(): void {
    this.dialogRef.close();
  }
}
