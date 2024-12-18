import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from 'src/app/SERVICE/patient.service';

@Component({
  selector: 'app-pharmacy-modal',
  templateUrl: './pharmacy-modal.component.html',
  styleUrls: ['./pharmacy-modal.component.scss']
})
export class PharmacyModalComponent {
  
  pharmacyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PharmacyModalComponent>,
    private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    this.pharmacyForm = this.fb.group({
      date: [new Date(), Validators.required],
      medication: ['', Validators.required],
      time: ['', Validators.required],
      route: ['', Validators.required],
      prescriber: ['', Validators.required],
      type: ['', Validators.required],
      method: ['', Validators.required],
      routine: ['', Validators.required],
    });
  }

 

  savePrescription(): void {
    if (this.pharmacyForm.valid) {
      console.log('Données à sauvegarder :', this.pharmacyForm.value); // Debug
      this.dialogRef.close(this.pharmacyForm.value);
    } else {
      console.error('Formulaire invalide :', this.pharmacyForm.errors);
    }
  }
  

  close(): void {
    this.dialogRef.close();
  }
}
