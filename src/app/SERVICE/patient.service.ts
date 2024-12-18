import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from '../patient.model';


@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientCollection: AngularFirestoreCollection<Patient>;
  patient$: Observable<Patient[]>;
  

  constructor(private firestore: AngularFirestore) {
    this.patientCollection = this.firestore.collection<Patient>('patients');
    this.patient$ = this.patientCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Patient;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  getPatients(): Observable<Patient[]> {
    return this.patient$;
  }

  getPatientById(id: string): Observable<Patient | undefined> {
    return this.patientCollection.doc(id).snapshotChanges().pipe(
      map(action => {
        const data = action.payload.data() as Patient;
        const id = action.payload.id;
        return { id, ...data };
      })
    );
  }

  addPatient(patient: Patient): Promise<void> {
    return this.patientCollection.add(patient).then(() => {}); // Explicitly returning void
  }

  updatePatient(id: string, patient: Partial<Patient>): Promise<void> {
    return this.patientCollection.doc(id).update(patient);
  }

  deletePatient(id: string): Promise<void> {
    return this.patientCollection.doc(id).delete();
  }

  getAllPrescriptions(): Observable<any[]> {
    return this.firestore
      .collectionGroup('prescriptions')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Données brutes depuis Firebase
            const id = a.payload.doc.id;
  
            // Validation pour s'assurer que data est un objet
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si data est invalide
            }
          })
        )
      );
  }

  getAllPatients(): Observable<any[]> {
    return this.firestore
      .collection('patients')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID et les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  
  
  getPrescriptions(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/prescriptions`)
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const rawData = a.payload.doc.data();
            const id = a.payload.doc.id;
  
            // Crée une copie sécurisée des données
            return Object.assign({ id }, rawData || {}); // Utilisation de Object.assign
          });
        })
      );
  }
  

  addPrescription(patientId: string, prescription: any): Promise<void> {
    console.log('Path:', `patients/${patientId}/prescriptions`);
    console.log('Data to Add:', prescription);
  
    return this.firestore
      .collection(`patients/${patientId}/prescriptions`)
      .add(prescription)
      .then(() => {
        console.log('Prescription ajoutée avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de la prescription :', error);
        throw error;
      });
  }
  
  
}
