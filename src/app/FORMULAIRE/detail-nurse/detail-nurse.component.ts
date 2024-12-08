import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { catchError, Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Patient } from 'src/app/patient.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail-nurse',
  templateUrl: './detail-nurse.component.html',
  styleUrls: ['./detail-nurse.component.scss']
})
export class DetailNurseComponent implements OnInit {
  medPasses = [
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    // More data here
  ];
  patientData = {
    dash: 'Details and dashboard for the patient.',
    profile: 'Patient profile information.',
    skinAndWound: 'Details about skin and wound care.'
    // Add other sections as needed
  };
  sections = [
    { title: 'Dash', content: this.patientData.dash },
    { title: 'Profile', content: this.patientData.profile },
    { title: 'Skin and Wound', content: this.patientData.skinAndWound },
    // Add other sections dynamically
  ];


  patient$: Observable<Patient| undefined> | null = null;

  constructor(private param:ActivatedRoute, private afs:PatientService, private firestore: AngularFirestore) {}

  ngOnInit(): void {
    const id = this.param.snapshot.paramMap.get('id');
    if (id) {
      console.log(`Fetching patient with ID: ${id}`);
      this.patient$ = this.afs.getPatientById(id).pipe(
        catchError(error => {
          console.error('Error fetching patient:', error);
          return of(undefined);
        }),
      );
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