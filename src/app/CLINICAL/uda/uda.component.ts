import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PatientUdaModalComponent } from 'src/app/FORMULAIRE/patient-uda-modal/patient-uda-modal.component';

@Component({
  selector: 'app-uda',
  templateUrl: './uda.component.html',
  styleUrls: ['./uda.component.scss']
})
export class UDAComponent implements OnInit {
 assessmentForm: FormGroup;
  tabs = ['Scheduled', 'In Progress', 'Completed'];
  currentTab = 'Scheduled';

  assessmentTypes: string[] = [
    'ALL',
    'Nursing: Weekly Skin Evaluation - V2',
    'Nursing: Lift and Transfer Evaluation - V5',
    'Nursing: Wandering & Elopement Evaluation 2016 - V6',
    'Nursing: Daily Skilled / Managed Care / PAE Progress Note - V3.4 - V7',
    'Nursing: Bowel Incontinence Evaluation',
    'Protocol: Nursing Evaluation Respiratory Compromise (weekly) - V2.0 - V4',
    'Nursing: Pain Evaluation, Cognitively Intact - V4',
    'Nutrition: Dietary Manager Quarterly/Annual Review - V7',
    'Discharge Assessment/Discussion (Ongoing)',
    'CRC: GG Evaluation - V2',
    'Nursing: Fall Risk Evaluation - V5',
    'BRADEN SCALE FOR PREDICTING PRESSURE SORE RISK',
    'eINTERACT Transfer Form V5',
    'Social Services: Quarterly Review - V2'
  ];

  patientAssessments = [
    {
      name: ' Doe',
      scheduleDescription: 'Quarterly',
      assessmentType: 'Nursing: Weekly Skin Evaluation - V2',
      dueDate: new Date('2024-12-12'),
      status: 'Scheduled'
    },
    {
      name: 'John',
      scheduleDescription: 'Quarterly',
      assessmentType: 'BRADEN SCALE FOR PREDICTING PRESSURE SORE RISK',
      dueDate: new Date('2024-12-12'),
      status: 'Scheduled'
    },
    {
      name: 'paul',
      scheduleDescription: 'Quarterly',
      assessmentType: 'Nutrition: Dietary Manager Quarterly/Annual Review - V7',
      dueDate: new Date('2024-12-12'),
      status: 'Scheduled'
    },
    {
      name: 'SON',
      scheduleDescription: 'Quarterly',
      assessmentType: 'Social Services: Quarterly Review - V2',
      dueDate: new Date('2024-12-12'),
      status: 'Scheduled'
    },
    {
      name: 'LIN',
      scheduleDescription: 'Quarterly',
      assessmentType: 'Nursing: Pain Evaluation, Cognitively Intact - V4',
      dueDate: new Date('2024-12-12'),
      status: 'Scheduled'
    },
    {
      name: 'Jane Smith',
      scheduleDescription: 'Manual',
      assessmentType: 'Nursing: Lift and Transfer Evaluation - V5',
      dueDate: new Date('2024-12-14'),
      status: 'In Progress'
    },
    {
      name: 'Mark Wilson',
      scheduleDescription: 'Quarterly',
      assessmentType: 'Nursing: Wandering & Elopement Evaluation 2016 - V6',
      dueDate: new Date('2024-12-16'),
      status: 'Completed'
    }
  ];

  filteredAssessments: any[] = [];

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.assessmentForm = this.fb.group({
      selectedAssessment: ['ALL'],
      daysFilter: [7]
    });
  }

  ngOnInit(): void {
    this.applyFilters();
  }
  openPatientDetailModal(): void {
    const dialogRef = this.dialog.open(PatientUdaModalComponent, {
      width: '600px',
      data: { patientId: 1, assessmentTypes: this.assessmentTypes } // Pass the assessment types
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal closed:', result);
    });
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
    this.applyFilters();
  }

  onAssessmentChange(): void {
    this.applyFilters();
  }

  onDaysChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const selectedValue = this.assessmentForm.value.selectedAssessment;
    const days = this.assessmentForm.value.daysFilter;
    const currentDate = new Date();

    this.filteredAssessments = this.patientAssessments.filter(assessment => {
      const dueDate = new Date(assessment.dueDate);
      const inDaysRange = (dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) <= days;
      const matchesStatus = assessment.status === this.currentTab;

      if (selectedValue === 'ALL') {
        return inDaysRange && matchesStatus;
      } else {
        return (
          assessment.assessmentType === selectedValue &&
          inDaysRange &&
          matchesStatus
        );
      }
    });
  }
}