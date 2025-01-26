import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  
  onSave(): void {
    if (!this.selectedAssessment || !this.assessmentDate || !this.assessmentRoutine) {
      alert('Veuillez remplir tous les champs.');
      
      return;
      }

    // Fermer la modal
    this.dialogRef.close();

    // Rediriger vers le composant spécifique
    this.router.navigate([this.selectedAssessment.component], {
      queryParams: {
        date: this.assessmentDate,
        time: this.assessmentTime,
        routine: this.assessmentRoutine
      }
    });
  }

  
}