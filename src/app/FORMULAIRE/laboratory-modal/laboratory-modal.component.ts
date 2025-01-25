import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-laboratory-modal',
  templateUrl: './laboratory-modal.component.html',
  styleUrls: ['./laboratory-modal.component.scss']
})
export class LaboratoryModalComponent  {
  laboratoryForm: FormGroup;

  selectedScheduleType: string | null = null;

  constructor(
    private fb: FormBuilder, private route:ActivatedRoute,  private dialog: MatDialog, private storage: AngularFireStorage, private firestore:AngularFirestore,
    public dialogRef: MatDialogRef<PharmacyModalComponent>,
    private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ){
    this.laboratoryForm = this.fb.group({
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
      diagnostique: ['', Validators.required],
      instructions: ['', Validators.required],
      indications: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      statut:['', Validators.required]
    });
  }

  onScheduleTypeChange(scheduleType: string): void {
    this.selectedScheduleType = scheduleType;
  }

  onSave(): void {
    const prescription = this.laboratoryForm.value;
    const routine = prescription.routine;
  
    // Générer les tâches journalières
    const dailyTasks = [];
    const startDate = new Date();
    for (let i = 0; i < routine.startDate; i++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + i);
  
      dailyTasks.push({
        date: taskDate.toISOString().split('T')[0],
        status: 'not-done', // Initial status
        method: prescription.method,
        prescriber: prescription.prescriber,
        time: prescription.time,
        type: prescription.type,
        instructions: prescription.instructions,
        startDate: prescription.startDate,
        endDate: prescription.endDate,

      });
    }
  
    if (this.laboratoryForm.valid) {
      // Ouvrir le modal d'authentification
      const prescriptionData = this.laboratoryForm.value;
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
   onSaver(): void {
    if (this.laboratoryForm.valid) {
      console.log('Données à sauvegarder :', this.laboratoryForm.value); // Debug
      this.dialogRef.close(this.laboratoryForm.value);
    } else {
      console.error('Formulaire invalide :', this.laboratoryForm.errors);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
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
}