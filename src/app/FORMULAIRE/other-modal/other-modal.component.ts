import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-other-modal',
  templateUrl: './other-modal.component.html',
  styleUrls: ['./other-modal.component.scss']
})
export class OtherModalComponent {
  otherForm!: FormGroup;
  selectedScheduleType: string | null = null;

  constructor(
    private fb: FormBuilder, private route:ActivatedRoute,
    public dialogRef: MatDialogRef<PharmacyModalComponent>,
    private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ){}
  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.otherForm = this.fb.group({
      date: [new Date(), Validators.required],
      time: ['', Validators.required],
      prescriber: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      method: ['', Validators.required],
      type: ['', Validators.required],
      frequency: ['', Validators.required],
      scheduleType: ['', Validators.required],
      everyXDays: [null],
      monday: [false], // Checkbox pour lundi
      tuesday: [false], // Checkbox pour mardi
      wednesday: [false], // Checkbox pour mercredi
      thursday: [false], // Checkbox pour jeudi
      friday: [false], // Checkbox pour vendredi
      saturday: [false], // Checkbox pour samedi
      sunday: [false], // Checkbox pour dimanche
      timeCode: ['', Validators.required],
      diagnosis: ['', Validators.required],
      instructions: ['', Validators.required],
      indications: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      route: ['', Validators.required],
    });
  }

  onScheduleTypeChange(scheduleType: string): void {
    this.selectedScheduleType = scheduleType;
  }

  onSave(): void {
    if (this.otherForm.valid) {
      console.log('Données à sauvegarder :', this.otherForm.value); // Debug
      this.dialogRef.close(this.otherForm.value);
    } else {
      console.error('Formulaire invalide :', this.otherForm.errors);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
