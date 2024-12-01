import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  constructor(private firestore: Firestore) {}

  saveRegistrationData(data: any) {
    const collectionRef = collection(this.firestore, 'reservations'); // Nom de la collection dans Firestore
    return addDoc(collectionRef, data);
  }
}

