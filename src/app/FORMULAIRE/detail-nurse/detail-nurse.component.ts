import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { catchError, Observable, of } from 'rxjs';
import { Patient } from 'src/app/patient.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';
import { LaboratoryModalComponent } from '../laboratory-modal/laboratory-modal.component';
import { DiagnosticModalComponent } from '../diagnostic-modal/diagnostic-modal.component';
import { NutritionModalComponent } from '../nutrition-modal/nutrition-modal.component';
import { OtherModalComponent } from '../other-modal/other-modal.component';
import { SupplementModalComponent } from '../supplement-modal/supplement-modal.component';
import { Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore'; // Ensure correct import
import { ProgesModalComponent } from '../proges-modal/proges-modal.component';
import { MedDiagnosticComponent } from '../med-diagnotic/med-diagnostic.component';
import { AllergyModalComponent } from '../allergy-modal/allergy-modal.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VaccinationModalComponent } from '../vaccination-modal/vaccination-modal.component';
import { DoctorModalComponent } from '../doctor-modal/doctor-modal.component';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { VitalsModalComponent } from '../vitals-modal/vitals-modal.component';
import { BradenScaleModalComponent } from '../braden-scale-modal/braden-scale-modal.component';
import { AssessmentModalComponent } from '../assessment-modal/assessment-modal.component';


@Component({
  selector: 'app-detail-nurse',
  templateUrl: './detail-nurse.component.html',
  styleUrls: ['./detail-nurse.component.scss']
})
export class DetailNurseComponent implements OnInit {
  [x: string]: any;
  @ViewChild('addEditModal') addEditModal: any;
  censusForm!: FormGroup;
  isEditing = false;
  editingId: string | null = null;

  assessments: any[] = [];
  loading: boolean = true;

  censusData = [
    { effectiveDate: '1/16/2025', primaryPayer: 'Medicaid GA', status: 'Active' },
    { effectiveDate: '1/16/2025', primaryPayer: 'Medicaid GA', status: 'Active' },
    { effectiveDate: '1/16/2025', primaryPayer: 'Medicaid GA', status: 'Active' },
    { effectiveDate: '1/16/2025', primaryPayer: 'Medicaid GA', status: 'Active' },
    // Ajoutez plus de données ici...
  ];
  censusDisplayedColumns: string[] = ['effectiveDate', 'primaryPayer', 'status'];

  // Données Level of Care (LOC)
  locData = [
    { effectiveFromDate: '8/1/2024', effectiveThruDate: '9/19/2024', skilled: 'N' },
    { effectiveFromDate: '4/2/2024', effectiveThruDate: '9/19/2024', skilled: 'N' },
    { effectiveFromDate: '8/4/2024', effectiveThruDate: '9/19/2024', skilled: 'Y' },
    { effectiveFromDate: '7/1/2025', effectiveThruDate: '9/19/2024', skilled: 'Y' },
    // Ajoutez plus de données ici...
  ];
  locDisplayedColumns: string[] = ['effectiveFromDate', 'effectiveThruDate', 'skilled'];

  contacts = [
    { name: 'Sheila Peeples', phoneEmail: 'Mobile: (478) 391-3242', relation: 'Sister', type: 'Responsible Party' },
    { name: 'Regdia Mathis', phoneEmail: 'Mobile: (478) 381-9302', relation: 'Daughter', type: 'Emergency Contact' },
    { name: 'Mary Mathis', phoneEmail: 'Home: (706) 741-7375', relation: 'Self', type: 'No Contact Type' },
  ];

  doctors = [
    { name: 'Maximo Beras Jovine', profession: 'Medical Director', phone: '(833) 578-2763' },
    { name: 'Brian Chadwick', profession: 'Primary Physician', phone: '(833) 578-2763' },
    { name: 'Cassandra Jones', profession: 'Nurse Practitioner', phone: '(833) 578-2763' },
  ];

  displayedColumnsContacts = ['name', 'phoneEmail', 'relation', 'type'];
  displayedColumnsDoctors = ['name', 'profession', 'phone'];

  nurseDetails: any; // Assuming this contains the Firestore data
  private subscriptions = new Subscription();
  @Input() patientId!: string;

    // Tableau des évaluations

  prescriptions: any[] = [];
  vital: any[] = [];
  allergies: any[] = [];
  progressNotes: any[] = [];
  diagnostic: any[] = [];
  vaccination: any[] = [];
  selectedPatientName: string | null = null;

  displayedColumnsa: string[] = [
    'name',
    'gender',
    'dob',
    'address',
    'quartier',
    'phone',
    'email',
    'docteur',
    'departement',
    'raison',
    'paiement',
  ];
  displayedColumnsallergy: string[] = [
    
    'date',
    'category',
    'status',
    'allergen',
    'allergyType',
    'severity',
    'manifestation',
    'note'
  ];
  displayedColumnsVaccinations: string[] = [
    'actions',
    'vaccineType',
    'administrationDate',
    'time',
    'routeOfAdministration',
    'dose',
    'locationGiven',
    'substanceExpirationDate',
    'administeredBy',
    'manufacturerName'
  ];

  displayedColumnsPrescriptions: string[] = ['description', 'category', 'instructions'];
  displayedColumnsAllergies: string[] = ['category', 'allergen', 'manifestation'];
  displayedColumnsProgressNotes: string[] = ['noteText', 'username', 'type'];
  displayedColumnsdiagnostic: string[] = ['code','commentaire', 'classification', 'description'];
  displayedColumnsVitals: string[] = [
    
        'taille',
'poids',
'temperature',
'saturation',
'respiration',
        
       'imc',
        'allergie',
        
        'systole',
        'dyastole',
        'poul',
        'couleur',
        'scapula',
        'cou',
        'rythme',
        
        
        'glycemie',
        'sanguin',
        'habitudes',
        'status',
        'poidN',
        'cranien',
        'poignet',
        'poitrine',
        'brachiale',
        'hanche',
        'allergieq',
        'description',
        'severité',
        'reaction',
        'tabac',
        'alcool',
        'histoire',
        'bouteilles',
        'cigarettes',
        'chirurgie',
        'medicament',
        'observations',
        'note',
        'douleur',
        'radio',
        'date',  ];

  emergencyColumns: string[] = ['Ename', 'relationship', 'Ephone', 'allergie', 'code', 'hospital'];

  displayedColumns: string[] = ['date', 'type', 'prescriber', 'description', 'category'];
  displayedColumns1: string[] = ['date', 'code', 'description', 'commentaire', 'rang', 'classification', 'username'];
  displayedColumns2: string[] = ['time', 'noteText', 'username', 'effectiveDate', 'type'];
  displayedColumns3: string[] = ['dueDate', 'name'];
  patient$: Observable<Patient | undefined> | null = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  selectedPatientId: string | null = null;
  items: any[] = []; // Define the items property

  createdDate = new Date();
   // Évaluation sélectionnée
  selectedAssessment: string | null = null;
  constructor(private fb: FormBuilder, private param: ActivatedRoute, private patientService: PatientService, private dialog: MatDialog, private route: ActivatedRoute, private overlay: Overlay) {
  }
  

  // Méthode appelée lors du changement de sélection
  onAssessmentChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    console.log('Selected Assessment ID:', target.value);
    this.selectedAssessment = target.value;
  }

  // Ouvrir la modal pour l'évaluation sélectionnée
  openAssessmentModal(): void {
    const dialogRef = this.dialog.open(AssessmentModalComponent, {
      width: '500px',
      data: { patientId: 'patient-id-exemple' } // Remplacez par l'ID réel
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Modal fermée. Recharge des données si nécessaire.');
    });
  }


  loadPrescriptions(patientId: string): void {
    this.selectedPatientId = patientId;
    this.patientService.getPrescriptions(patientId).subscribe(
      (prescriptions) => {
        this.prescriptions = prescriptions;
        this.dataSource.data = prescriptions;
        console.log('Prescriptions chargées :', prescriptions);
      },
      (error) => {
        console.error('Erreur lors du chargement des prescriptions:', error);
      }
    );
  }
  loadAllergies(patientId: string): void {
    this.selectedPatientId = patientId;
    this.patientService.getAllergies(patientId).subscribe(
      (allergies) => {
        this.allergies = allergies;
        this.dataSource.data = allergies;
        console.log('Prescriptions chargées :', allergies);
      },
      (error) => {
        console.error('Erreur lors du chargement des prescriptions:', error);
      }
    );
  }

  loadProgressNote(patientId: string): void {
    this.selectedPatientId = patientId;
    this.patientService.getProgressNote(patientId).subscribe(
      (progressNotes) => {
        this.progressNotes = progressNotes;
        this.dataSource.data = progressNotes;
        console.log('progressNotes chargées :', progressNotes);
      },
      (error) => {
        console.error('Erreur lors du chargement des prescriptions:', error);
      }
    );
  }

  loadVaccinations(patientId: string): void {
    this.selectedPatientId = patientId;

    this.patientService.getVaccin(patientId).subscribe(
      (vaccinations) => {
        this.vaccination = vaccinations;
        this.dataSource.data = vaccinations;
        console.log('vaccinations chargées :', vaccinations);
      },
      (error) => {
        console.error('Erreur lors du chargement des vaccinations:', error);
      }
    );
  }
  loadDiagnostic(patientId: string): void {
    this.selectedPatientId = patientId;

    this.patientService.getDiagnostic(patientId).subscribe(
      (diagnostics) => {
        this.diagnostic = diagnostics;
        this.dataSource.data = diagnostics;
        console.log('Diagnostique chargées :', diagnostics);
      },
      (error) => {
        console.error('Erreur lors du chargement des Diagnostiques:', error);
      }
    );
  }
  loadVitals(patientId: string): void {
    this.selectedPatientId = patientId;

    this.patientService.getVitals(patientId).subscribe(
      (vitals) => {
        this.vital = vitals;
        this.dataSource.data = vitals;
        console.log('Diagnostique chargées :', vitals);
      },
      (error) => {
        console.error('Erreur lors du chargement des Diagnostiques:', error);
      }
    );
  }
  loadAssessments(): void {
    this.patientService.getAssessments(this.patientId).subscribe(data => {
      this.assessments = data;
      this.loading = false;
    });
  }



  



  ngOnInit(): void {

    

    const patientId = this.param.snapshot.paramMap.get('id');
    if (patientId) {

      this.patient$ = this.patientService.getPatientById(patientId);

      this.loadPrescriptions(patientId);
      this.loadDiagnostic(patientId);
      this.loadProgressNote(patientId);
      this.loadAllergies(patientId);
      this.loadVaccinations(patientId);
      this.loadVitals(patientId);
      this.loadAssessments();
    } else {
      console.error('Patient ID not found in route.');
    }
  }



  openDiagnosticModal(category: string): void {
    let dialogRef;
    switch (category) {
      case 'MedDiagnostic':
        dialogRef = this.dialog.open(MedDiagnosticComponent, {
          width: '700px',
          data: { category }
        });
        break;
      default:
        console.error('Catégorie inconnue:', category);
        return;
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(`MedDiagnostic ajoutée pour ${category}:`, result);
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Diagnostique ajoutée :', result); // Debug
        const patientId = this.param.snapshot.paramMap.get('id');
        if (patientId) {
          this.patientService.addDiagnostic(patientId, result)
            .then(() => {
              console.log('MedDiagnostic ajoutée avec succès dans Firebase.');
              this.loadDiagnostic(patientId); // Rafraîchir les prescriptions
            })
            .catch((error) => console.error('Erreur d\'ajout dans Firebase :', error));
        } else {
          console.error('Patient ID manquant.');
        }
      }
    });
  }
  openVaccinationModal(category: string): void {
    let dialogRef;
    switch (category) {
      case 'Vaccination':
        dialogRef = this.dialog.open(VaccinationModalComponent, {
          width: '800px',
          data: { category }
        });
        break;
      default:
        console.error('Catégorie inconnue:', category);
        return;
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(`vaccinations ajoutée pour ${category}:`, result);
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('vaccinations ajoutée :', result); // Debug
        const patientId = this.param.snapshot.paramMap.get('id');
        if (patientId) {
          this.patientService.addVaccinations(patientId, result)
            .then(() => {
              console.log('Vaccination ajoutée avec succès dans Firebase.');
              this.loadVaccinations(patientId); // Rafraîchir les prescriptions
            })
            .catch((error) => console.error('Erreur d\'ajout dans Firebase :', error));
        } else {
          console.error('Patient ID manquant.');
        }
      }
    });
  }
  openAllergyNoteModal(category: string): void {
    let dialogRef;
    switch (category) {
      case 'Allergy':
        dialogRef = this.dialog.open(AllergyModalComponent, {
          width: '700px',
          data: { category }
        });
        break;
      default:
        console.error('Catégorie inconnue:', category);
        return;
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(`Allergie ajoutée pour ${category}:`, result);
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Allergie ajoutée :', result); // Debug
        const patientId = this.param.snapshot.paramMap.get('id');
        if (patientId) {
          this.patientService.addAllergy(patientId, result)
            .then(() => {
              console.log('Allergie ajoutée avec succès dans Firebase.');
              this.loadAllergies(patientId); // Rafraîchir les prescriptions
            })
            .catch((error) => console.error('Erreur d\'ajout dans Firebase :', error));
        } else {
          console.error('Patient ID manquant.');
        }
      }
    });
  }
  openProgressNoteModal(category: string): void {
    let dialogRef;
    switch (category) {
      case 'ProgressNote':
        dialogRef = this.dialog.open(ProgesModalComponent, {
          width: '700px',
          data: { category }
        });
        break;
      default:
        console.error('Catégorie inconnue:', category);
        return;
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(`progressNote ajoutée pour ${category}:`, result);
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Progress ajoutée :', result); // Debug
        const patientId = this.param.snapshot.paramMap.get('id');
        if (patientId) {
          this.patientService.addProgressNote(patientId, result)
            .then(() => {
              console.log('progressNote ajoutée avec succès dans Firebase.');
              this.loadProgressNote(patientId); // Rafraîchir les prescriptions
            })
            .catch((error) => console.error('Erreur d\'ajout dans Firebase :', error));
        } else {
          console.error('Patient ID manquant.');
        }
      }
    });
  }
  openVitalsModal(category: string): void {
    let dialogRef;
    switch (category) {
      case 'Vitals':
        dialogRef = this.dialog.open(VitalsModalComponent, {
          width: '1500px',
          data: { category }
        });
        break;
      default:
        console.error('Catégorie inconnue:', category);
        return;
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(`progressNote ajoutée pour ${category}:`, result);
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Progress ajoutée :', result); // Debug
        const patientId = this.param.snapshot.paramMap.get('id');
        if (patientId) {
          this.patientService.addVitals(patientId, result)
            .then(() => {
              console.log('Signe Vitals ajoutée avec succès dans Firebase.');
              this.loadVitals(patientId); // Rafraîchir les prescriptions
            })
            .catch((error) => console.error('Erreur d\'ajout dans Firebase :', error));
        } else {
          console.error('Patient ID manquant.');
        }
      }
    });
  }


  openPrescriptionModal(category: string): void {
    let dialogRef;
    switch (category) {
      case 'Pharmacy':
        dialogRef = this.dialog.open(PharmacyModalComponent, {
          width: '700px',
          data: { category }
        });
        break;
      case 'Other':
        dialogRef = this.dialog.open(OtherModalComponent, {
          width: '700px',
          data: { category }
        });
        break;
      case 'Laboratory':
        dialogRef = this.dialog.open(LaboratoryModalComponent, {
          width: '700px',
          data: { category }
        });
        break;
      case 'Nutrition':
        dialogRef = this.dialog.open(NutritionModalComponent, {
          width: '700px',
          data: { category }
        });
        break;
      case 'Supplement':
        dialogRef = this.dialog.open(SupplementModalComponent, {
          width: '700px',
          data: { category }
        });
        break;
      default:
        console.error('Catégorie inconnue:', category);
        return;
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(`Prescription ajoutée pour ${category}:`, result);
      }
    });


    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Prescription ajoutée :', result); // Debug
        const patientId = this.param.snapshot.paramMap.get('id');
        if (patientId) {
          this.patientService.addPrescription(patientId, result)
            .then(() => {
              console.log('Prescription ajoutée avec succès dans Firebase.');
              this.loadPrescriptions(patientId); // Rafraîchir les prescriptions
            })
            .catch((error) => console.error('Erreur d\'ajout dans Firebase :', error));
        } else {
          console.error('Patient ID manquant.');
        }
      }
    });
  }


  openContactModal(): void {
    const dialogRef = this.dialog.open(ContactModalComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.contacts.push(result);
      }
    });
  }

  openDoctorModal(): void {
    const dialogRef = this.dialog.open(DoctorModalComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.doctors.push(result);
      }
    });
  }
  // Méthode pour afficher une allergie
  viewAllergy(allergy: any): void {
    const dialogRef = this.dialog.open(AllergyModalComponent, {
      width: '500px',
      data:  allergy,
    });
    
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
      }
    });

    
  }
  updateVaccination(vaccinations: any): void {
    const dialogRef = this.dialog.open(VaccinationModalComponent, {
      width: '500px',
      data:  vaccinations,
    });
    
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
      }
    });

    
  }
  

  // Modifier une allergie
  updateAllergy(allergy: any): void {
    const updatedData = { ...allergy, status: 'Inactive' }; // Exemple de mise à jour
  
    this.patientService
      .updateAllergy(this.patientId, allergy.id, updatedData)
      .then(() => console.log('Allergie mise à jour avec succès'))
      .catch((error) => console.error('Erreur lors de la mise à jour :', error));
  }

  // Barrer une allergie
  strikeoutAllergy(allergy: any): void {
    this.patientId = this.param.snapshot.paramMap.get('patientId') || 'defaultPatientId';
    if (!this.patientId) {
      console.error('Erreur : patientId est manquant.');
      return;
    }
  
    const confirmation = confirm(`Voulez-vous vraiment supprimer l'allergie ${allergy.allergen} ?`);
    if (confirmation) {
      this.patientService.deleteAllergy(this.patientId, allergy.id)
        .then(() => {
          console.log(`Allergie ${allergy.allergen} supprimée avec succès.`);
          this.loadAllergies(this.patientId); // Recharge les allergies après suppression
        })
        .catch((err) => {
          console.error('Erreur lors de la suppression de l\'allergie :', err);
        });
    }
  }
  strikeoutVaccination(allergy: any): void {
    this.patientId = this.param.snapshot.paramMap.get('patientId') || 'defaultPatientId';
    if (!this.patientId) {
      console.error('Erreur : patientId est manquant.');
      return;
    }
  
    const confirmation = confirm(`Voulez-vous vraiment supprimer la vacination`);
    if (confirmation) {
      this.patientService.deleteVaccination(this.patientId, allergy.id)
        .then(() => {
          console.log(`Allergie ${allergy.allergen} supprimée avec succès.`);
          this.loadAllergies(this.patientId); // Recharge les allergies après suppression
        })
        .catch((err) => {
          console.error('Erreur lors de la suppression de l\'allergie :', err);
        });
    }
  }

  // Recharger les allergies après une modification
  refreshAllergies(): void {
    this.patientService.getAllergies(this.patientId).subscribe((data) => {
      this.allergies = data;
    });
  }

  editPatient(): void {
    // Logic to edit patient details

  }

  printPatient(): void {
    // Logic to print patient details
  }


  generatePDFAndSaveToFirebase() {
    const doc = new jsPDF();
  
    // Titre
    doc.setFontSize(14);
    doc.text('INOVACARE Pro', 105, 10, { align: 'center' });
    doc.addImage('https://res.cloudinary.com/dtdpx59sc/image/upload/v1731817061/android-chrome-192x192_egyemw.png', 'PNG', 10, 5,  20, 20);
        doc.text('Census List', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 30);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 15, 35);
    doc.text(`User: Jephthe Nkwanmen`, 15, 40);
  
    // Colonnes du tableau
    const columns = [
      'Effective Date',
      'Time',
      'Status',
      'Action Code',
      'Location',
      'Revised by',
      'Revision Date',
      'Revised From'
    ];
  
    // Données du tableau
    const rows = this.censusData.map((item: any) => [
      item.effectiveDate,
      item.time,
      item.status,
      item.actionCode,
      item.location,
      item.revisedBy,
      item.revisionDate,
      item.revisedFrom
    ]);
  
    // Ajout du tableau au PDF
    autoTable(doc, {
      startY: 50,
      head: [columns],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 102, 204] },
    });
  
    // Enregistrer ou ouvrir le PDF localement
    const pdfOutput = doc.output('blob');
  
    // Enregistrer dans Firebase
    const storageRef = ref(getStorage(), `census_reports/${new Date().toISOString()}.pdf`);
    const uploadTask = uploadBytesResumable(storageRef, pdfOutput);
  
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        console.log('Upload in progress...');
      },
      (error) => {
        console.error('Upload failed:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at:', downloadURL);
        });
      }
    );
  
    // Optionnel : Télécharger le fichier localement
    doc.save('Census_Report.pdf');
  }


   // Ajouter une nouvelle évaluation
   async addAssessment(): Promise<void> {
    const assessment = {
      name: 'BRADEN SCALE FOR PREDICTING PRESSURE SORE RISK',
      routine: 'weekly',
      nextDueDate: this.patientService.calculateNextDueDate('weekly'),
      status: 'pending'
    };

    await this.patientService.addAssessment(this.patientId, assessment);
    this.loadAssessments(); // Recharger les évaluations après l'ajout
  }

  // Marquer une évaluation comme complétée
  async completeAssessment(assessmentId: string, routine: string): Promise<void> {
    const nextDueDate = this.patientService.calculateNextDueDate(routine);
    await this.patientService.updateAssessment(this.patientId, assessmentId, {
      status: 'completed',
      nextDueDate: nextDueDate
    });
    this.loadAssessments(); // Recharger les évaluations après la mise à jour
  }

  // Vérifier si une évaluation est dépassée
  isOverdue(nextDueDate: string): boolean {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    return dueDate < today;
  }

} 
