import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  constructor(private firestore: AngularFirestore) {}

  // Compter le nombre total de patients
  

  // Compter les prescriptions actives (status: not_done)

  getPrescriptionCount(status: string): Observable<number> {
    return this.firestore
      .collectionGroup('prescriptions', ref => ref.where('status', '==', status))
      .get()
      .pipe(
        map(snapshot => {
          snapshot.forEach(doc => console.log('Prescription:', doc.data()));
          return snapshot.size;
        })
      );
  }
  
  
  

  
  updatePrescriptionsWithMissingDates(): void {
    this.firestore.collection('patients').snapshotChanges().subscribe(actions => {
      actions.forEach(action => {
        const prescriptionsRef = action.payload.doc.ref.collection('prescriptions');
        prescriptionsRef.get().then(snapshot => {
          snapshot.forEach(doc => {
            const data = doc.data();
            if (!data['dateStart'] || !data['dateEnd']) {
              prescriptionsRef.doc(doc.id).update({
                dateStart: data['dateStart'] || new Date().toISOString(),
                dateEnd: data['dateEnd'] || new Date().toISOString()
              }).then(() => {
                console.log('Prescription mise à jour:', doc.id);
              });
            }
          });
        });
      });
    });
  }
  
  logPrescriptionsWithMissingDates(): void {
    this.firestore.collection('patients').snapshotChanges().subscribe(actions => {
      actions.forEach(action => {
        const prescriptionsRef = action.payload.doc.ref.collection('prescriptions');
        prescriptionsRef.get().then(snapshot => {
          snapshot.forEach(doc => {
            const data = doc.data();
            if (!data['dateStart'] || !data['dateEnd']) {
              console.warn('Prescription incomplète:', doc.id, data);
            }
          });
        });
      });
    });
  }

  fixPrescriptionsWithoutDates(): void {
    this.firestore.collection('patients').snapshotChanges().subscribe(actions => {
      actions.forEach(action => {
        const prescriptionsRef = action.payload.doc.ref.collection('prescriptions');
        prescriptionsRef.get().then(snapshot => {
          snapshot.forEach(doc => {
            const data = doc.data();
            if (!data['dateStart'] || !data['dateEnd']) {
              prescriptionsRef.doc(doc.id).update({
                dateStart: data['dateStart'] || new Date().toISOString(),
                dateEnd: data['dateEnd'] || new Date().toISOString()
              }).then(() => console.log(`Prescription corrigée : ${doc.id}`));
            }
          });
        });
      });
    });
  }
  
  
  
  

  // Compter les prescriptions terminées (status: done)
  getCompletedPrescriptions(): Observable<number> {
    return this.firestore.collection('patients').get().pipe(
      map(snapshot => {
        let completedPrescriptionsCount = 0;
        const promises: Promise<void>[] = [];
  
        snapshot.forEach(doc => {
          const prescriptionsRef = doc.ref.collection('prescriptions');
          const promise = prescriptionsRef
            .where('status', '==', 'done') // Filtrer les prescriptions terminées
            .get()
            .then(subSnapshot => {
              completedPrescriptionsCount += subSnapshot.size;
            });
  
          promises.push(promise);
        });
  
        return Promise.all(promises).then(() => completedPrescriptionsCount); // Retourner le total
      }),
      switchMap(count => from(count)) // Convertir en Observable
    );
  }
  

  getTotalPatients(): Observable<number> {
    return this.firestore
      .collection('patients')
      .valueChanges()
      .pipe(map(patients => patients.length));
  }
  getActivePrescriptions(): Observable<number> {
    return this.firestore.collection('patients').get().pipe(
      map(snapshot => {
        let activePrescriptionsCount = 0;
        const promises: Promise<void>[] = [];
  
        snapshot.forEach(doc => {
          const prescriptionsRef = doc.ref.collection('prescriptions');
          const promise = prescriptionsRef
            .where('status', '==', 'not_done')
            .where('endDate', '>=', new Date().toISOString()) // Comparer les dates
            .get()
            .then(subSnapshot => {
              activePrescriptionsCount += subSnapshot.size; // Ajouter le nombre de prescriptions actives
            });
  
          promises.push(promise); // Ajouter la promesse
        });
  
        return Promise.all(promises).then(() => activePrescriptionsCount); // Retourner le total
      }),
      switchMap(count => from(count)) // Convertir en Observable
    );
  }
  

  getPatientsUnderAntibiotic(): Observable<number> {
    return this.firestore.collection('patients').get().pipe(
      map(snapshot => {
        const patientIds = new Set<string>();
        const promises: Promise<void>[] = []; // Typage explicite pour promises
  
        snapshot.forEach(doc => {
          const prescriptionsRef = doc.ref.collection('prescriptions');
          const promise = prescriptionsRef.where('type', '==', 'Antibiotic').get().then(subSnapshot => {
            if (!subSnapshot.empty) {
              patientIds.add(doc.id); // Ajouter l'ID du patient
            }
          });
          promises.push(promise); // Ajouter chaque Promise à la liste
        });
  
        return Promise.all(promises).then(() => patientIds.size); // Retourner le nombre de patients uniques
      }),
      switchMap(count => from(count)) // Convertir en Observable
    );
  }
  
  
}