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
  antibioticMedications = [
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    // Add more entries here
  ];

  progressNotes = [
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    // Add more entries here
  ];

  labResults = [
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    // More data here
  ];

  clinicalAlerts = [
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
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