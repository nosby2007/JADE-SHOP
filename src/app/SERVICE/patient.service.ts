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

  getPrescriptionsByPatient(patientId: string): Observable<any[]> {
  return this.firestore
    .collection(`patients/${patientId}/prescriptions`)
    .snapshotChanges()
    .pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data(); // Récupère les données
          const id = a.payload.doc.id; // Récupère l'ID du document

          // Validation des données avant l'utilisation de l'opérateur spread
          if (data && typeof data === 'object') {
            return { id, ...data }; // Combine l'ID avec les données
          } else {
            console.error('Données non valides pour le document avec ID :', id, data);
            return { id }; // Retourne uniquement l'ID si les données sont invalides
          }
        })
      )
    );
}

  
  

addPrescription(patientId: string, prescription: any): Promise<void> {
  return this.firestore
    .collection(`patients/${patientId}/prescriptions`)
    .add(prescription)
    .then(() => console.log('Prescription added'))
    .catch((error) => console.error('Error adding prescription:', error));
}

  // Marquer une tâche comme effectuée
  markPrescriptionAsDone(patientId: string, prescriptionId: string): Promise<void> {
    return this.firestore
      .doc(`patients/${patientId}/prescriptions/${prescriptionId}`)
      .update({ status: 'done' });
  }  
  updatePrescriptionStatus(patientId: string, prescriptionId: string, data: any): Promise<void> {
    return this.firestore
      .collection(`patients/${patientId}/prescriptions`)
      .doc(prescriptionId)
      .update(data);
  }
  
  
}
