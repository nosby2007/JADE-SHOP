import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Pro } from '../proffessionel.model';
import { Patient } from '../patient.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessionelsService {
  private proCollection: AngularFirestoreCollection<Pro>;
  pro$: Observable<Pro[]>;

  constructor(private firestore: AngularFirestore) {
    this.proCollection = firestore.collection<Pro>('professionels');
    this.pro$ = this.proCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Pro;
          const id = a.payload.doc.id;
          return { id, ...data }; // Return patient data with the document ID
        })
      )
    );
  }

  getProfessionel(): Observable<Pro[]> {
    return this.pro$; // Return the observable for the patient list
  }

  addProfessionel(professionels: Pro): Promise<void> {
    return this.proCollection.add(professionels).then(() => {
      console.log('Patient added successfully');
    });
  }

  getProfessionelById(id: string): Observable<Pro | undefined> {
    return this.proCollection.doc(id).snapshotChanges().pipe(
      map(action => {
        const data = action.payload.data() as Pro;
        const id = action.payload.id;
        return { id, ...data };
      })
    );
  }

  updateProfessionel(id: string, item: Partial<Pro>): Promise<void> {
    return this.proCollection.doc(id
      
    ).update(item).then(() => {
      console.log('Professionel updated successfully');
    });
  }

  deleteProfessionel(id: string): Promise<void> {
    return this.proCollection.doc(id).delete().then(() => {
      console.log('Professionel supprimé avec succes');
    });
  }
}
