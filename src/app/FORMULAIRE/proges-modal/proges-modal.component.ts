import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/SERVICE/auth.service';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-proges-modal',
  templateUrl: './proges-modal.component.html',
  styleUrls: ['./proges-modal.component.scss']
})
export class ProgesModalComponent implements OnInit {

  progressNoteForm!: FormGroup;
  noteTypes = ['Alert', 'Communication', 'Discharge', 'Follow-up Wound Note', 'Medical Notes', 'Accident Notes'];
  createdBy = 'Jephté Nkwammen'; // Exemple de valeur
  createdDate = new Date();

  constructor(
    private fb: FormBuilder, private route:ActivatedRoute, private storage: AngularFireStorage,
    private patientService: PatientService, private dialog: MatDialog, private authService:AuthService, private firestore: AngularFirestore,
    public dialogRef: MatDialogRef<ProgesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void{
    this.progressNoteForm = this.fb.group({
      type: ['', Validators.required],
      carePlanItem: [''],
      effectiveDate: [new Date(), Validators.required],
      time: ['', Validators.required],
      noteText: ['', Validators.required],
      showOnShiftReport: [false],
      showOn24HourReport: [false],
      showOnMDReport: [false],
      editCarePlan: [false],
      username:['', Validators.required],
      password:['', Validators.required,],
    });
  }

  onSave(): void {
    if (this.progressNoteForm.valid) {
      // Ouvrir le modal d'authentification
      const prescriptionData = this.progressNoteForm.value;
      const dialogRef = this.dialog.open(AuthModalComponent);

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // Si la signature est validée, sauvegarder et générer le PDF
          this.onSaver();
          this.generatePdf(prescriptionData);
        } else {
          console.log('Validation annulée.');
        }
      });
    } else {
      console.error('Le formulaire est invalide.');
    }
  }
  onSaver(): void {
    if (this.progressNoteForm.valid) {
      console.log('Données à sauvegarder :', this.progressNoteForm.value); // Debug
      this.dialogRef.close(this.progressNoteForm.value);
    } else {
      console.error('Formulaire invalide :', this.progressNoteForm.errors);
    }
  }
 
  private generatePdf(data: any): void {
    const doc = new jsPDF();

    // Ajout des informations dans le PDF
    doc.text('Récapitulatif de la Note de progression', 14, 20);
    doc.text(`Temps : ${data.time}`, 14, 40);
    doc.text(`Catégorie : ${data.type}`, 14, 50);
    doc.text(`effectiveDate : ${data.effectiveDate}`, 14, 60);
    doc.text(`Prescripteur : ${data.username}`, 14, 70);
    doc.text(`Description : ${data.noteText}`, 14, 80);

    // Tableau des détails
    autoTable(doc, {
      head: [['Champ', 'Valeur']],
      body: [
        ['Type', data.type],
        ['Date de création', data.effectiveDate],
        ['Description', data.noteText],
    
      ],
      startY: 90,
    });

    // Ouvrir le PDF dans une nouvelle fenêtre
    doc.output('dataurlnewwindow');
  }
  openPdf(filePath: string): void {
    this.storage.ref(filePath).getDownloadURL().subscribe(
      (url) => {
        window.open(url, '_blank'); // Ouvrir le PDF dans une nouvelle fenêtre
      },
      (error) => {
        console.error('Erreur lors de la récupération du fichier :', error);
      }
    );
  }
  
}
