import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private firestore: AngularFirestore) { }
  // Add a new appointment
  addAppointment(appointmentData: any) {
    return this.firestore.collection('appointments').add(appointmentData);
  }

  // Get all appointments
  getAppointments(): Observable<any> {
    return this.firestore.collection('appointments').snapshotChanges();
  }

  // Update an appointment
  updateAppointment(appointmentId: string, appointmentData: any) {
    return this.firestore.collection('appointments').doc(appointmentId).update(appointmentData);
  }

  // Delete an appointment
  deleteAppointment(appointmentId: string) {
    return this.firestore.collection('appointments').doc(appointmentId).delete();
  }
}
