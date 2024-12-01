import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent {
  personalInfoForm: FormGroup;
  contactForm: FormGroup;
  serviceForm: FormGroup;
  accountForm: FormGroup;
  services = [
    { name: 'Soins des plaies' },
    { name: 'Soins Infirmiers a domicile' },
    { name: 'fomation Premiers secour' },
    { name: 'Evènements' },
    { name: 'Partenariats' },
    { name: 'Formations' }
  ];
 

  constructor(private fb: FormBuilder, private firestore: AngularFirestore) {
    this.personalInfoForm = this.fb.group({
      userName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]]
    });

    this.contactForm = this.fb.group({
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required]
    });

    this.serviceForm = this.fb.group({
      serviceName: ['', Validators.required],
      reservationDate: ['', Validators.required]
    });

    this.accountForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  passwordsMatch(): boolean {
    return this.accountForm.get('password')?.value === this.accountForm.get('confirmPassword')?.value;
  }

  submitReservation(): void {
    const reservation = {
      ...this.personalInfoForm.value,
      ...this.contactForm.value,
      ...this.serviceForm.value,
      ...this.accountForm.value
    };

    this.firestore.collection('reservations').add(reservation)
      .then(() => alert('Réservation confirmée !'))
      .catch((error) => console.error('Erreur :', error));
  }
}
