import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { catchError, Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Patient } from 'src/app/patient.model';

@Component({
  selector: 'app-patien-details',
  templateUrl: './patien-details.component.html',
  styleUrls: ['./patien-details.component.scss']
})
export class PatienDetailsComponent implements OnInit {
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