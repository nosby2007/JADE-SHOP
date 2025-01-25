import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-vaccination-modal',
  templateUrl: './vaccination-modal.component.html',
  styleUrls: ['./vaccination-modal.component.scss']
})
export class VaccinationModalComponent implements OnInit {

  vaccineForm: FormGroup;
  vaccineTypes: string[] = [
    'COVID-19',
    'Influenza',
    'Hepatitis B',
    'Measles',
    'Mumps',
    'Rubella',
    'Polio',
    'Tetanus',
    'Diphtheria',
    'Varicella',
    'Human Papillomavirus (HPV)'
  ];

  routesOfAdministration: string[] = ['Oral', 'Intramuscular', 'Subcutaneous', 'Intravenous'];
  units: string[] = ['mg', 'ml', 'IU'];
  locations: string[] = ['Left Arm', 'Right Arm', 'Left Thigh', 'Right Thigh'];
  admins: string[] = ['Dr. Smith', 'Nurse Alice', 'Technician John'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<VaccinationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.vaccineForm = this.fb.group({
      administrationDate: ['', Validators.required],
      time: [''],
      routeOfAdministration: ['', Validators.required],
      vaccineType: ['', Validators.required],
      dose: ['', [Validators.required, Validators.maxLength(6)]],
      unit: ['', Validators.required],
      locationGiven: ['', Validators.required],
      administeredBy: ['', Validators.required],
      substanceExpirationDate: [''],
      manufacturerName: ['', [Validators.maxLength(50)]],
      lotNumber: ['', [Validators.maxLength(10)]],
    });
  }

  ngOnInit(): void {}

  onSave(): void {
    if (this.vaccineForm.valid) {
      this.dialogRef.close(this.vaccineForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}