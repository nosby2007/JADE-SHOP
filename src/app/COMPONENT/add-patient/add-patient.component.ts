import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';

import { Patient } from 'src/app/patient.model';


@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss']
})
export class AddPatientComponent implements OnInit {
  patientForm: FormGroup;
  createdDate = new Date();
  profession: string[] = [
    'CONSULTATION',
    'CPN',
    'RENDEZ-VOUS',
    'LABORATOIRE',
    'VACCINATION',
  ];
 
  region: string[] = [
    'ASSURANCE',
    'CASH',
    'Autres',
  ];
  gender: string[] = [
    'Male',
    'Female',
  ];
  public registerForm!: FormGroup;
  public userIdToUpdate!:number;
  public isUpdateActive: boolean = false;

  raison: string[] = [
    'CONSULTATION',
    'SOIN A DOMICILE',
    'RENDEZ-VOUS',
    'LABORATOIRE',
    'VACCINATION',
    'PANSEMENT',
    'REHABILITATION',
    'FORMATION',
    'AMBULANCE',
    'AUTRE',
  ];
  departement: string[] = [
    'Consultation',
    'Laboratoire',
    'Rehabilitation',
    'Vaccination',
    'Pansement',
    'Formation',
    'Soin à domicile',
    'Ambulance',
  ];
  docteur: string[] = [
    'BERNARD TCHAMI',
    'SYVIE ETOUNDI',
    'MARIE LOGPON',
    'GEREMIE FOTSING',
    'MARIE SIDOINE',
    'SANDRINE TOULETAC',
  ]
  paiement: string[] = [
    'ASSURANCE',
    'CASH',
    'Autres',
    'cheque'
  ];
 
  code: string[] = [
    'Reanimation Cardio pulmonaire',
    'Ne pas réanimer',
    'Prendre toutes les mesures de maintient en vie',
    'Ne pas intuber',
    'Ne pas ventiler',
    'Ne pas faire de dialyse',
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
      "Kilwin",
      'Kamsonghin',
      'Karpala',
      'Koulouba',
      'Koubri',
      'Koubou',
      'Kossodo',
      'Kouka',
      'Koubri',
      'Koubou',
  ]
  hospital: string[] = [ 
   ' ougagougou',
   'Centre Hospitalier Universitaire Yalgado Ouédraogo (CHU-YO) 03 BP 7022 Ouagadougou 03 Telephone: 25-31-16-55/56/57 ',
   'Centre Hospitalier Universitaire Pédiatrique Charles de Gaulle (CHUP-CDG) 01 BP 680 Ouagadougou 01 Telephone: 25-30-67-00 ',
   'Centre Hospitalier Universitaire Souro Sanou (CHUSS) 01 BP 7022 Bobo-Dioulasso Telephone: 20-97-01-00 ',
   'Centre Hospitalier Universitaire de Tengandogo (CHU-T) 01 BP 7022 Ouagadougou 01 Telephone: 25-37-52-00 ',
   'Centre Médical International (CMI) - Former French Clinic Rue Nazi Boni Telephone: 25-30-66-07 / 70-20-00-00 / 76-19-99-99 ',
    'Centre Médical Saint Camille (CMSC) 01 BP 310 Ouagadougou 01 Telephone: 25-30-64-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Dori 01 BP 25 Dori Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Gaoua 01 BP 25 Gaoua Telephone: 20-97-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Kaya 01 BP 25 Kaya Telephone: 25-36-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Koudougou 01 BP 25 Koudougou Telephone: 25-37-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Ouahigouya 01 BP 25 Ouahigouya Telephone: 25-43-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Tenkodogo 01 BP 25 Tenkodogo Telephone: 25-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Ziniaré 01 BP 25 Ziniaré Telephone: 25-36-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Zorgho 01 BP 25 Zorgho Telephone: 25-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Réo 01 BP 25 Réo Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Manga 01 BP 25 Manga Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Diapaga 01 BP 25 Diapaga Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Nouna 01 BP 25 Nouna Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Dédougou 01 BP 25 Dédougou Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Boulsa 01 BP 25 Boulsa Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Koupéla 01 BP 25 Koupéla Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Sapouy 01 BP 25 Sapouy Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Ouargaye 01 BP 25 Ouargaye Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Pô 01 BP 25 Pô Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Gourcy 01 BP 25 Gourcy Telephone: 20-47-00-00 ',
    'Centre Médical avec Antenne Chirurgicale (CMA) de Kongoussi 01 BP 25 Kongoussi Telephone: 20-47-00-00 ',
    'Clinique El Fateh-Suka Pediatrics/Gynecology/General consultations  04 BP 8297 Ouagadougou 04 Telephone: 25-43-06-00/01 ',
    'Clinique "Les Genêts" 05 BP 6047 Ouagadougou 05 Telephone: 25-37-43-80 / 78-88-38-88 ',
    'Clinique "Les Oliviers" 01 BP 25 Ouagadougou 01 Telephone: 25-30-67-00 ',
    'Clinique "Les Orchidées" 01 BP 25 Ouagadougou 01 Telephone: 25-30-67-00 ',
    'Hopital Blaise Compaore 11 BP 104 CMS Ouagadougou 01 Telephone: 25-50-96-62 / 25-50-96-65 / 25-50-96-66', 
    'Polyclinique Internationale (former Clinique du Cœur) 01 BP 2092 Ouaga 2000 (Sector 15) Telephone: 25-48-35-28/29', 
    'Polyclinique Notre Dame de la Paix (PNDP) 01 BP 5666 Ouagadougou 01 (Secteur 24) Telephone: 25- 35-61-55 / 25-35-71-06',
    'Ambulance Services Burkina Secours Telephone: 76-60-60-60', 
    'Alain Saignol Centre Medical International (CMI)  Telephone: 70-20-00-00 / 76-19-99-99', 
    'Sapeurs Pompiers Hotline: 18 Other lines: 25-31-47-03 / 25-31-47-95', 
    'Angel MedFlight Worldwide Air Ambulance Website: http://www.angelmedflight.com/  Phone: International (480) 634-8017 1',
    'MEDICAL CENTERS AND FACILITIES Phone: Toll-free in the U.S. 877-264-3570',
    'Laboratory Tests Laboratoire d’Analyses Médicales du Centre (L.A.M.C)   Telephone: 25-31-35-57 / 25-33-72-35', 
    'Dr. Ferdinand Tiemtore Laboratoire d\'Analyses Médicales Ste Elizabeth Telephone: 25-31-67-57', 
    'Dr. Kadi Traore Laboratoire de Biologie Médicale de la Clinique Philadelphie Telephone: 25-33-28-71',
    'Dr. Jean Sakande Laboratoire de la Clinique Sandoff - on Avenue Babanguida Telephone: 25-36-09-06', 
    'Pr. Robert Soudre Service D\'Hygiene International and other Vaccinations  Telephone: 25-30 71 89 Cardiology', 
    'Pr. Lucie Nébié and Pr. Ali Niankara Polyclinique Internationale (former Clinique du Cœur) Telephone: 25-39-74-74', 
    'Dr. André Samandoulgou Polyclinique Nina - Blvd Charles De Gaulle Telephone: 25-36-33-81 / 70-13-80-62',  
    'Also consults at Clinique Notre Dame de la Paix - Somgandé Telephone: 25-35-61-53/55', 
    'Dentist Dr. Rose Drabo Clinique Le Rosier - Ouaga 2000 Telephone: 25-37-60-10', 
    'Dr. Armand Malam Clinique Le Rosier - Ouaga 2000 Telephone: 25-37-60-10', 
    'Dr. Daniel Thiombiano Clinique Dentaire ADRA - Opposite St. Exupéry French School Telephone: 25-30-86-21', 
    'Dr. Ernest Toé Clinique Dentaire ERAS Koulouba Château d’eau Telephone: 25-31-36-14 / 70-20-51-31', 
    'Dermatology Pr. Pascal Niamba  Clinique Notre Dame de la Paix - Somgandé Telephone: 25-35-61-53/55',
    'Dr. Muriel OUEDRAOGO Clinique Philadelphie – Koulouba Telephone: 25-33-28-71', 
    'Endocrinology / Internal Medicine Pr. Joseph Drabo  Hopital Yalgado Ouédraogo (CHUYO) Telephone: 25-31-16-55',
    'Also consults at Clinique Notre Dame de la Paix  Telephone: 25-35-61-53/55',
    'Pr. Hervé Tieno Hopital Yalgado Ouédraogo Telephone: 25-31-16-55 ENT (ORL)', 
    'Dr. Madi KABRE Clinique Tanga - Pissy Telephone: 25-43-56-17 / 70-21-53-13', 
    'Pr. Kampadilemba Ouoba Clinique Notre Dame de la Paix - Somgandé Telephone: 25-35-61-53/55',
    'Gastroenterology Pr. Alain Bougouma Clinique Sandoff Telephone: 25-36-09-06',
    'Dr. Soter Ouédraogo Clinique Notre Dame de la Paix – Somgandé Telephone: 25-35-61-53/55',
    ' Dr. Roger Sombié Hopital Yalgado Ouédraogo Telephone: 25-31-16-56', 
    'General Practioner Dr. Van Dingenen  Telephone: 76-14-14-60', 
    'Dr. Alain Hien Clinique Notre Dame de la Compassion - Tampouy Telephone: 25-35-26-27 / 70-26-30-36', 
    'Dr. Jean-Marc Mauxaux  Former French Embassy Clinic Telephone: 25-30-66-07 After hours: 70-20-00-00 Ambulance: 78-04-04-40 Gynecology',
    'Pr. Bibiane Koné Clinique Moussa Koné - 1200 Logements Telephone: 25-36-14-79',
    ' Pr. Jean Lankouandé Clinique Yentema Telephone: 25-33-70-70',
    ' Dr. Charlemagne Ouédraogo Clinique Moussa Koné Telephone: 25-36-14-79',
    ' Dr. Salifou Traoré Clinique Notre Dame de la Paix - Somgandé Telephone: 25-35-61-53/55',
    ' Dr. Paul Stanislas Zoungrana Clinique Les Genets - Ouaga 2000 Telephone: 25-37-43-80 / 78-88-38-88 / 70- 20-56-22 Hematology', 
    'Dr. Koulidiaty Clinique Notre Dame de la Paix Telephone: 25-35-61-53/55 Also consults at Clinique Sandof Telephone: 25-36-09-06', 
    ' Physiotherapy Mr. Emile Dossin French Embassy Clinic Telephone: 25-30-66-07', 
    'Mr. Jean Forogo Telephone: 70-24-99-04 Mr. David Granda Telephone: 78-46-50-55', 
    'Mr. Angelin Poda Telephone: 70-12-31-31 Mr. Jeremy Sedgo Telephone: 70-26-60-40 Neurology',
    'Pr. Jean Kaboré CHU Yalgado Ouédraogo Telephone: 25-31-16-56',
    ' Dr. Christian Napon CHU Yalgado Ouedraogo  Telephone: 25-31-16-56 Also consults at Polyclinique Notre Dame de la Paix Telephone: 25-35-80-80 Ophthalmology', 
    'Dr. René Kan Clinique Simigna Telephone: 25-36-27-87',
    ' Dr. Moumouni Ouédraogo Clinique Ophtalmologique La Lumière Telephone: 25-33-50-74',
    'Dr. Virginie Tapsoba Clinique La Providence Telephone: 25-34-64-60 Orthopaedy',
    'Dr. Théophile-Marie Compaoré Clinique Saint-Jean Telephone: 25-33-56-22 / 25-31-18-61',
    'Pediatrics Dr. Jean-Baptiste Ouédraogo Clinique Notre Dame de la Paix - Somgandé Telephone: 25- 35-61-55', 
    'Dr. Tall Clinique El Fateh-Suka Telephone: 25-43-06-00/01  Psychiatry', 
    'Dr. Moussa Kéré Clinique Notre Dame de la Paix - Somgandé Telephone: 25-35-80-80',
    'Dr. Harouna Ouédraogo Hôpital Yalgado Ouédraogo - Psychiatry Ward  Telephone: 25- 31-16-55 Psychologist',
     'Dr. De Cecco French Embassy Clinic Telephone: 25-33-99-07 - Please leave message Rheumatology', 
     'Dieudonné Ouédraogo CHU Yalgado Ouédraogo Telephone: 25-31-16-55 Clinique',
     'YATI ZAD Ouaga Telephone: 25-35-61-53/55 Joelle TIENTREBEOGO/ZABSONRE', 
     'Hôpital Yalgado Ouedraogo Telephone: 25-31-16-55 X-rays & Ultrasounds', 
     'Clinique Médicale Shiphra (Protestant Medical Center) - Tanghin Telephone: 25-33-32-29 / 25-30-09-86/87', 
     'Dr. Bernard Ouédraogo Polyclinique Nina - Blvd Charles De Gaulle Telephone: 25-36-33-81', 
     'CHU Yalgado Ouédraogo Telephone: 25-31-16-56 6 | P a g e City of Ouagadougou',      
    'Dr. Assane Yago Radiologie Centrale - Downtown Telephone: 25-31-13-09',
    'Hôpital Saint Camille MRI center Telephone: 25-36-30-56 7'


  ]

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
      admission: ['',Validators.required],      
      code: ['', Validators.required],      
      allergie: ['', Validators.required],      
      hospital: ['', Validators.required],      
    });



   }

  ngOnInit(): void {

  }


  submit(){
    this.patientService.addPatient(this.registerForm.value).then(res=>{
      this.registerForm.reset();
      this.router.navigate(['/patientCli'])
  
      
    })
    
  }
  updated(){
    this.patientService.updatePatient(this.userIdToUpdate.toString(), this.registerForm.value).then(() => {
      this.registerForm.reset();
      this.router.navigate(['/patientCli'])
    }).catch((error) => {
      console.error('Error updating patient: ', error);
    });
  }
  
  fillFormToUpdate(user:Patient){
    this.registerForm.setValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      ordre:user.ordre,
      Department: user.Department,
      profession: user.profession,
      gender: user.gender,
      region: user.region,
      date: user.date,
      EMContact: user.EMContact,
      cni: user.cni,
      age: user.age,
      docteur:user.docteur,
      adresse:user.adresse,
      barre:user.barre,
      typatient:user.typatient,
      paiement:user.paiement,
    })
    
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
