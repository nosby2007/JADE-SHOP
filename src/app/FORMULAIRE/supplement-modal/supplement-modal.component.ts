import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'app-supplement-modal',
  templateUrl: './supplement-modal.component.html',
  styleUrls: ['./supplement-modal.component.scss']
})
export class SupplementModalComponent  {

  SuplementForm: FormGroup;
  selectedScheduleType: string | null = null;

  constructor(
     private fb: FormBuilder, private dialog: MatDialog, private storage: AngularFireStorage, private firestore:AngularFirestore,
        private patientService: PatientService,
        public dialogRef: MatDialogRef<PharmacyModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    this.SuplementForm = this.fb.group({
      date: [new Date(), Validators.required],
      time: ['', Validators.required],
      prescriber: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      method: ['', Validators.required],
      type: ['', Validators.required],
      frequency: ['', Validators.required],
      scheduleType: ['', Validators.required],
      everyXDays: [null],
      monday: [false], // Checkbox pour lundi
      tuesday: [false], // Checkbox pour mardi
      wednesday: [false], // Checkbox pour mercredi
      thursday: [false], // Checkbox pour jeudi
      friday: [false], // Checkbox pour vendredi
      saturday: [false], // Checkbox pour samedi
      sunday: [false], // Checkbox pour dimanche
      timeCode: ['', Validators.required],
      diagnosis: ['', Validators.required],
      instructions: ['', Validators.required],
      indications: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
    
}

onScheduleTypeChange(scheduleType: string): void {
  this.selectedScheduleType = scheduleType;
}

onSaver(): void {
  if (this.SuplementForm.valid) {
    console.log('Données à sauvegarder :', this.SuplementForm.value); // Debug
    this.dialogRef.close(this.SuplementForm.value);
  } else {
    console.error('Formulaire invalide :', this.SuplementForm.errors);
  }
}

onCancel(): void {
  this.dialogRef.close();
}

onSave(): void {
  if (this.SuplementForm.valid) {
    // Ouvrir le modal d'authentification
    const prescriptionData = this.SuplementForm.value;
    const dialogRef = this.dialog.open(AuthModalComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Si la signature est validée, sauvegarder et générer le PDF
        this.onSaver();
        this.generateAndSavePDF(prescriptionData);
      } else {
        console.log('Validation annulée.');
      }
    });
  } else {
    console.error('Le formulaire est invalide.');
  }
}



private generatePdf(data: any): void {
  const doc = new jsPDF();

  // Ajout des informations dans le PDF
  doc.text('Récapitulatif de la Prescription', 14, 20);
  doc.text(`Date : ${data.date}`, 14, 30);
  doc.text(`Temps : ${data.time}`, 14, 40);
  doc.text(`Catégorie : ${data.category}`, 14, 50);
  doc.text(`Méthode : ${data.method}`, 14, 60);
  doc.text(`Prescripteur : ${data.prescriber}`, 14, 70);
  doc.text(`Description : ${data.description}`, 14, 80);

  // Tableau des détails
  autoTable(doc, {
    head: [['Champ', 'Valeur']],
    body: [
      ['Type', data.type],
      ['Route', data.route],
      ['Fréquence', data.frequency],
      ['Planification', data.scheduleType],
      ['Diagnostic', data.diagnosis],
      ['Directives', data.instructions],
      ['Indications', data.indications],
      ['Date de Début', data.startDate],
      ['Date de Fin', data.endDate]
    ],
    startY: 90,
  });

  // Ouvrir le PDF dans une nouvelle fenêtre
  doc.output('dataurlnewwindow');
}

async generateAndSavePDF(patientData: Record<string, any>) {
  try {
    // Génération du PDF
    const doc = new jsPDF();
    doc.text('Rapport de la prescription', 10, 40);

    // Transformation explicite des données pour correspondre au type attendu
    const tableBody: string[][] = Object.entries(patientData).map(
      ([key, value]) => [key, String(value)]
    );

    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Value']],
      body: tableBody, // Utilisation des données transformées
    });
    doc.output('dataurlnewwindow');

    // Conversion du PDF en Blob
    const pdfBlob = doc.output('blob');

    // Définir le chemin et le nom du fichier dans Firebase Storage
    const filePath = `pdfs/${new Date().toISOString()}_PatientReport.pdf`;

    // Téléverser le fichier dans Firebase Storage
    const fileRef = this.storage.ref(filePath);
    const uploadTask = await this.storage.upload(filePath, pdfBlob);
    

    // Obtenir l'URL de téléchargement
    const downloadURL = await fileRef.getDownloadURL().toPromise();

    // Sauvegarder les métadonnées dans Firestore
    await this.firestore.collection('pdfs').add({
      filePath,
      downloadURL,
      createdAt: new Date(),
      patientData,
    });

    console.log('Fichier PDF sauvegardé avec succès dans Firestore et Storage.');
  } catch (error) {
    console.error('Erreur lors de la génération ou de la sauvegarde du PDF :', error);
  }

  
  
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