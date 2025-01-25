import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  constructor(private firestore: AngularFirestore) {}

  getPrescriptionsByDate(patientId: string, currentDate: Date): Observable<any[]> {
    const today = currentDate.toISOString();
  
    return this.firestore
      .collection(`patients/${patientId}/prescriptions`, ref =>
        ref.where('startDate', '<=', today)
      )
      .valueChanges()
      .pipe(
        map(prescriptions =>
          prescriptions.filter((prescription: any) =>
            prescription.endDate >= today
          )
        )
      );
  }
  
  updatePrescriptionStatus(patientId: string, prescriptionId: string, status: string): Promise<void> {
    return this.firestore
      .doc(`patients/${patientId}/prescriptions/${prescriptionId}`)
      .update({ status });
  }
}
