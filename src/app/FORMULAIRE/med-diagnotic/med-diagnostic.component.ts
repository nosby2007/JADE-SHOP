import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { ProgesModalComponent } from '../proges-modal/proges-modal.component';

@Component({
  selector: 'app-med-diagnostic',
  templateUrl: './med-diagnostic.component.html',
  styleUrls: ['./med-diagnostic.component.scss']
})
export class MedDiagnosticComponent implements OnInit {

  
  diagnosticForm!: FormGroup;
  rangs = ['Diagnostic Primaire', 'Diagnostique 2', 'Diagnostique 3', 'Diagnostique 4', 'Diagnostique 5', 'Diagnostique 6', 'Diagnostique 7'];
  classifications = ['Admission', 'Readmission', 'Pendant Hospitalisation', 'historique', 'Décharge', 'Transfert'];
  createdBy = 'Jephté Nkwammen'; // Exemple de valeur
  createdDate = new Date();

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    public dialogRef: MatDialogRef<MedDiagnosticComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {}

  ngOnInit(): void {
    this.diagnosticForm = this.fb.group({
      code: [''],
      date: [new Date(), Validators.required],
      rang: ['', Validators.required],
      description: [''],
      classification: ['', Validators.required],
      commentaire: ['', Validators.required],
      confidential: [false],
      therapy: [false],
      username:['', Validators.required],
      password:['', Validators.required,],
    });
  }

  saveDiagnostic(): void {
    if (this.diagnosticForm.valid) {
      console.log('Données à sauvegarder :', this.diagnosticForm.value); // Debug
      this.dialogRef.close(this.diagnosticForm.value);
    } else {
      console.error('Formulaire invalide :', this.diagnosticForm.errors);
    }
  }
  

  close(): void {
    this.dialogRef.close();
  }
}