import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';

@Component({
  selector: 'app-nutrition-modal',
  templateUrl: './nutrition-modal.component.html',
  styleUrls: ['./nutrition-modal.component.scss']
})
export class NutritionModalComponent  {

  nutritionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PharmacyModalComponent>,
    private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    this.nutritionForm= this.fb.group({
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
    if (this.nutritionForm.valid) {
      console.log('Données à sauvegarder :', this.nutritionForm.value); // Debug
      this.dialogRef.close(this.nutritionForm.value);
    } else {
      console.error('Formulaire invalide :', this.nutritionForm.errors);
    }
  }
  

  close(): void {
    this.dialogRef.close();
  }
}
