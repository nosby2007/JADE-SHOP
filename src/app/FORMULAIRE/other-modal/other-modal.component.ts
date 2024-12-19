import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';

@Component({
  selector: 'app-other-modal',
  templateUrl: './other-modal.component.html',
  styleUrls: ['./other-modal.component.scss']
})
export class OtherModalComponent {
  otherForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PharmacyModalComponent>,
    private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    this.otherForm = this.fb.group({
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
    if (this.otherForm.valid) {
      console.log('Données à sauvegarder :', this.otherForm.value); // Debug
      this.dialogRef.close(this.otherForm.value);
    } else {
      console.error('Formulaire invalide :', this.otherForm.errors);
    }
  }
  

  close(): void {
    this.dialogRef.close();
  }
}
