import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-assessment-modal',
  templateUrl: './assessment-modal.component.html',
  styleUrls: ['./assessment-modal.component.scss']
})
export class AssessmentModalComponent  {
  assessments = [
    { id: 'braden', name: 'BRADEN SCALE FOR PREDICTING PRESSURE SORE RISK', component: '/braden' },
    { id: 'fall-risk', name: 'Fall Risk Evaluation', component: '/fall-risk' },
    { id: 'nutrition', name: 'Nutrition Assessment', component: '/nutrition' }
  ];

  selectedAssessment: any = null;
  assessmentDate: Date | null = null;
  assessmentTime: string | null = null;
  assessmentRoutine: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<AssessmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Inclut des données si nécessaire
    private firestore: Firestore,
    private router: Router
  ) {}

  calculateNextDate(routine: string): Date {
    const nextDate = new Date(this.assessmentDate || new Date());
    if (routine === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (routine === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (routine === 'quarterly') {
      nextDate.setMonth(nextDate.getMonth() + 3);
    }
    return nextDate;
  }

  async onSave(): Promise<void> {
    if (!this.selectedAssessment || !this.assessmentDate || !this.assessmentRoutine) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    try {
      // Collection principale : assessments
      const assessmentsCollection = collection(this.firestore, 'assessments');
      const newAssessment = {
        name: this.selectedAssessment.name,
        date: this.assessmentDate,
        routine: this.assessmentRoutine,
        nextDueDate: this.calculateNextDate(this.assessmentRoutine)
      };

      // Sauvegarde dans la collection assessments
      const assessmentDoc = await addDoc(assessmentsCollection, newAssessment);

      // Sous-collection dans le patient
      const patientAssessmentRef = doc(this.firestore, `patients/${this.selectedAssessment.patientId}/assessments/${assessmentDoc.id}`);
      await setDoc(patientAssessmentRef, newAssessment);

      // Fermer la modale et rediriger
      this.dialogRef.close();
      this.router.navigate([`/assessments/${this.selectedAssessment.name}`]); // Redirection vers l'évaluation
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement :', error);
      alert('Une erreur s\'est produite lors de l\'enregistrement.');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}