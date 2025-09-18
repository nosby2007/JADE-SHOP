import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { catchError, Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Patient } from 'src/app/patient.model';
import firebase from 'firebase/compat/app'
import { Timestamp } from '@angular/fire/firestore';



@Component({
  selector: 'app-patien-details',
  templateUrl: './patien-details.component.html',
  styleUrls: ['./patien-details.component.scss']
})
export class PatienDetailsComponent implements OnInit {
  patient$: Observable<Patient| undefined> | null = null;
  patientDetails:any;
  displayedColumnsa: string[] = [
    'name',
    'gender',
    'dob',
    'address',
    'quartier',
    'phone',
    'email',
    'docteur',
    'departement',
    'raison',
    'paiement',
  ];

  emergencyColumns: string[] = ['Ename', 'relationship', 'Ephone', 'allergie', 'code', 'hospital', 'admission'];
  

 

  constructor(private param:ActivatedRoute, private afs:PatientService, private firestore: AngularFirestore) {
    
    this.patientDetails = {
      createdAt: Timestamp.fromMillis(1734670800 * 1000), // Mock Firestore Timestamp
    };
  
    // Convert Firestore Timestamp to JavaScript Date
    if (this.patientDetails.createdAt instanceof Timestamp) {
      this.patientDetails.createdAt = this.patientDetails.createdAt.toDate();
    }
  }
  
  

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


  timestampToDate(timestamp: firebase.firestore.Timestamp | null): Date | null {
    if (timestamp) {
      return timestamp.toDate();
    }
    return null;
  }
} 