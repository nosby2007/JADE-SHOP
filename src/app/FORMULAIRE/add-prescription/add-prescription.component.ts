import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { catchError, Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Patient } from 'src/app/patient.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';
import { LaboratoryModalComponent } from '../laboratory-modal/laboratory-modal.component';
import { DiagnosticModalComponent } from '../diagnostic-modal/diagnostic-modal.component';
import { NutritionModalComponent } from '../nutrition-modal/nutrition-modal.component';
import { OtherModalComponent } from '../other-modal/other-modal.component';
import { SupplementModalComponent } from '../supplement-modal/supplement-modal.component';
import { Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore'; // Ensure correct import

@Component({
  selector: 'app-add-prescription',
  templateUrl: './add-prescription.component.html',
  styleUrls: ['./add-prescription.component.scss']
})
export class AddPrescriptionComponent implements OnInit {
  nurseDetails: any; // Assuming this contains the Firestore data
  private subscriptions = new Subscription();
  @Input() patientId!: string;
  prescriptionForm: FormGroup;
  prescriptions: any[] = [];
displayedColumns: string[] = ['date', 'prescriber', 'time', 'method', 'routine', 'route', 'type'];
  patient$: Observable<Patient| undefined> | null = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor(private fb: FormBuilder, private param:ActivatedRoute, private patientService: PatientService, private dialog:MatDialog) {
    this.prescriptionForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      method: ['', Validators.required],
      prescriber: ['', Validators.required],
      type: ['', Validators.required],
      route: ['', Validators.required]
    });
 }

 fetchPrescriptions() {
  this.patientService.getPrescriptions(this.patientId).subscribe((data) => {
    this.prescriptions = data;
  });
}

loadPrescriptions(patientId: string): void {
  this.patientService.getPrescriptions(patientId).subscribe(
    (prescriptions) => {
      console.log('Prescriptions récupérées:', prescriptions);
      this.prescriptions = prescriptions;
      this.dataSource.data = this.prescriptions; // Mise à jour du tableau
    },
    (error) => {
      console.error('Erreur lors de la récupération des prescriptions:', error);
    }
  );
}
ngOnInit(): void {
  const id = this.param.snapshot.paramMap.get('id');
  if (id) {
    const sub = this.patientService.getPrescriptions(this.patientId).subscribe(
      (prescriptions) => {
        this.prescriptions = prescriptions;
        this.dataSource.data = this.prescriptions;
      }
    );
    this.subscriptions.add(sub);

    console.log(`Fetching patient with ID: ${id}`);
    this.patient$ = this.patientService.getPatientById(id).pipe(
      catchError(error => {
        console.error('Error fetching patient:', error);
        return of(undefined);
      }),
    );
    this.loadPrescriptions(this.patientId);
  } else {
    console.error('No valid ID provided in route');
    this.patient$ = of(undefined);
  }
}

editPatient(): void {
  // Logic to edit patient details
}

printPatient(): void {
  // Logic to print patient details
}

}
