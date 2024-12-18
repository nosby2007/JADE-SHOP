import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Patient } from 'src/app/patient.model';
import { PatientService } from 'src/app/SERVICE/patient.service';

@Component({
  selector: 'app-edit-patient',
  templateUrl: './edit-patient.component.html',
  styleUrls: ['./edit-patient.component.scss']
})
export class EditPatientComponent implements OnInit {
  editPatientForm: FormGroup;
  raison = ['CONSULTATION', 'SOIN A DOMICILE', 'RENDEZ-VOUS', 'LABORATOIRE', 'VACCINATION', 'PANSEMENT'];
  departement = ['Medecine Générale', 'CPN', 'Maternite', 'Laboratoire', 'Petit Chirurgie', 'Pharmacie', 'Vaccination'];
  docteur = ['BERNARD TCHAMI', 'SYVIE ETOUNDI', 'MARIE FOTSING'];
  paiement = ['ASSURANCE', 'CASH', 'Autres'];
  gender = ['Male', 'Female'];
  quartier = [
    'Ouaga 2000', 'Dassasgho', 'Koulouba', 'Gounghin', 'Zogona', 'Tanghin', 
    'Cissin', 'Pissy', 'Nongr-Massom', 'Zongo'
  ];

  constructor(
    private fb: FormBuilder, private patientService:PatientService,
    private dialogRef: MatDialogRef<EditPatientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Patient
  ) {
    this.editPatientForm = this.fb.group({
      name: '', 
      dob: '', 
      gender: '', 
      phone: '', 
      email: '', 
      address: '', 
      paiement: '', 
      docteur: '', 
      departement: '', 
      raison: '', 
      quartier: '', 
      Ename: '', 
      relationship: '', 
      Ephone: ''
     });}

  ngOnInit(): void {
    this.loadPatientData('patientId')
  
  }

  onSubmit(): void {
    if (this.editPatientForm.valid) {
      const updatedData = { ...this.data, ...this.editPatientForm.value };
      this.dialogRef.close(updatedData); // Send updated data back to the parent
    }
  }
  loadPatientData(id: string): void {
    this.patientService.getPatientById(id).subscribe((patient) => {
      if (patient) {
        this.editPatientForm.patchValue(patient); // Charger les données dans le formulaire
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
