import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';


@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss']
})
export class AddPatientComponent implements OnInit {
  patientForm: FormGroup;
  raison: string[] = [
    'CONSULTATION',
    'SOIN A DOMICILE',
    'RENDEZ-VOUS',
    'LABORATOIRE',
    'VACCINATION',
    'PANSEMENT',
  ];
  departement: string[] = [
    'Medecine Générale',
    'CPN',
    'Maternite',
    'Laboratoire',
    'Petit Chirurgie',
    'Pharmacie',
    'Vaccination',
  ];
  docteur: string[] = [
    'BERNARD TCHAMI',
    'SYVIE ETOUNDI',
    'MARIE FOTSING'
  ]
  paiement: string[] = [
    'ASSURANCE',
    'CASH',
    'Autres',
  ];
  gender: string[] = [
    'Male',
    'Female',
  ];
  quartier: string [] = [
    
      "Ouaga 2000",
      "Dassasgho",
      "Koulouba",
      "Gounghin",
      "Zogona",
      "Tanghin",
      "Cissin",
      "Pissy",
      "Nongr-Massom",
      "Zongo",
  ]
  public registerForm!: FormGroup;
  public userIdToUpdate!:number;
  public isUpdateActive: boolean = false;

  constructor(private fb: FormBuilder, private patientService: PatientService, private router:Router) {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      paiement: ['', Validators.required],
      docteur: ['', Validators.required],
      departement: ['', Validators.required],
      raison: ['', Validators.required],
      quartier: ['', Validators.required],
      Ename: ['', Validators.required],
      relationship: ['', Validators.required],
      Ephone: ['', Validators.required],      
    });
   }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.patientForm.valid) {
      this.patientService.addPatient(this.patientForm.value).then(() => {
      this.router.navigate(['patientList'])
        console.log('Patient added successfully!');
        this.patientForm.reset();
      }).catch((error) => {
        console.error('Error adding patient: ', error);
      });
    }
  }
  update(){
   
  }


}
