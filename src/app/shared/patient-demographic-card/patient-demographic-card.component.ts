import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from 'src/app/nurse/models/patient.model';


@Component({
  selector: 'app-patient-demographic-card',
  templateUrl: './patient-demographic-card.component.html',
  styleUrls: ['./patient-demographic-card.component.scss']
})
export class PatientDemographicCardComponent implements OnInit {
  @Input() patientId!: string;

  vm$!: Observable<{
    name: string;
    preferredName?: string;
    gender?: string;
    dob?: any;
    admissionDate?: any;
    phone?: string;
    email?: string;
    addressLine?: string;
    language?: string;
    maritalStatus?: string;
    codeStatus?: string;
    primaryCareProvider?: string;
    referringProvider?: string;
    preferredPharmacy?: string;
    heightCm?: string | number;
    weightKg?: string | number;
    allergies?: string[];
    diagnoses?: string[];
    emergencyName?: string;
    emergencyPhone?: string;
    emergencyRelation?: string;
  }>;

  constructor(private afs: AngularFirestore) {}

  ngOnInit(): void {
    this.vm$ = this.afs.doc<Patient>(`patients/${this.patientId}`).valueChanges().pipe(
      map(p => {
        if (!p) return { name: '(Unknown patient)' };

        // Nom d’affichage
        const name = p.preferredName?.trim() || p.name?.trim() || '(Unnamed)';

        // Adresse (assemble les champs plats si présents)
        const parts = [
          p.address, p.address1, p.address2,
          [p.city, p.state].filter(Boolean).join(', '),
          p.zip, p.country
        ].filter(Boolean);
        const addressLine = parts.join(' · ');

        // Urgences : on supporte à la fois les champs plats et l’objet nested legacy
        const emergencyName = p.emergencyContactName || p.emergencyContact?.name;
        const emergencyPhone = p.emergencyContactPhone || p.emergencyContact?.phone;
        const emergencyRelation = p.emergencyRelation || p.emergencyContact?.relation;

        return {
          name,
          preferredName: p.preferredName,
          gender: p.gender,
          dob: p.dob,
          admissionDate: p.admissionDate,
          phone: p.phone,
          email: p.email,
          addressLine: addressLine || undefined,
          language: p.language,
          maritalStatus: p.maritalStatus,
          codeStatus: p.codeStatus,
          primaryCareProvider: p.primaryCareProvider || p.docteur, // compat legacy
          referringProvider: p.referringProvider,
          preferredPharmacy: p.preferredPharmacy,
          heightCm: p.heightCm,
          weightKg: p.weightKg,
          allergies: p.allergies,
          diagnoses: p.diagnoses,
          emergencyName,
          emergencyPhone,
          emergencyRelation
        };
      })
    );
  }
}
