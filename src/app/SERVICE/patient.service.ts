import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Action } from 'rxjs/internal/scheduler/Action';
import { SubscriptionLoggable } from 'rxjs/internal/testing/SubscriptionLoggable';
import { map} from 'rxjs/operators';
import { Patient } from '../patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  getPatients() {
    throw new Error('Method not implemented.');
  }
  
  @Injectable({
    providedIn: 'root'
  })

  private patientCollection: AngularFirestoreCollection<Patient>;
  patient$: Observable<Patient[]>;

  constructor(private firestore: AngularFirestore) {
    this.patientCollection = firestore.collection<Patient>('patients');
    //use  snapshotchanges() to get real-time data with metadata
    this.patient$ = this.patientCollection.snapshotChanges().pipe(
      map(actions=> actions.map(a =>{
        const data = a.payload.doc.data() as Patient;
        const id = a.payload.doc.id;
        return { id, ...data }; // Maintenant ça ne crée plus de conflit
      }))
    );
   }
   //create doc

   addPatient(patient: Patient):Promise<void> {  
      return this.patientCollection.add(patient).then(()=>{
        
      })
   }
// read single document

   getPatientById(id: string): Observable<Patient| undefined> {
    return this.patientCollection.doc(id).snapshotChanges().pipe(
      map(action => {
        const data = action.payload.data() as Patient;
        const id = action.payload.id;
        return {
          id, ...data
        };
      }))
   };

   //update

   updatePatient(id: string, item: Partial<Patient>):Promise<void> {
    return this.patientCollection.doc(id).update(item).then(()=>{});
   }
   
   //delete

   deletePatient(id: string): Promise<void> {
    return this.patientCollection.doc(id).delete().then(()=>{});
   }
}  