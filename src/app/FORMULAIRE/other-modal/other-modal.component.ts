import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-other-modal',
  templateUrl: './other-modal.component.html',
  styleUrls: ['./other-modal.component.scss']
})
export class OtherModalComponent {
  otherForm: FormGroup;
  selectedScheduleType: string | null = null;

  constructor(
    private fb: FormBuilder, private route:ActivatedRoute,
    public dialogRef: MatDialogRef<PharmacyModalComponent>,
    private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ){
    this.otherForm = this.fb.group({
      date: [new Date(), Validators.required],
      time: ['', Validators.required],
      prescriber: ['', Validators.required],
      type: ['', Validators.required],
      method: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      frequency: ['', Validators.required],
      scheduleType: ['', Validators.required],
      routine: this.fb.group({
        frequency: [1, [Validators.required, Validators.min(1)]],
        duration: [1, [Validators.required, Validators.min(1)]],
        instructions: ['', Validators.required],
        everyXDays: [null], // Optionnel
        monday: [false],
        tuesday: [false],
        wednesday: [false],
        thursday: [false],
        friday: [false],
        saturday: [false],
        sunday: [false],
        timeCode: ['', Validators.required],
        diagnosis: ['', Validators.required],
        indications: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required]
      }),
      
    });
  }

  onScheduleTypeChange(scheduleType: string): void {
    this.selectedScheduleType = scheduleType;
  }

  onSave(): void {
    const prescription = this.otherForm.value;
    const routine = prescription.routine;
  
    // Générer les tâches journalières
    const dailyTasks = [];
    const startDate = new Date();
    for (let i = 0; i < routine.duration; i++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + i);
  
      dailyTasks.push({
        date: taskDate.toISOString().split('T')[0],
        status: 'not-done', // Initial status
        medication: prescription.medication,
        method: prescription.method,
        prescriber: prescription.prescriber,
        route: prescription.route,
        time: prescription.time,
        type: prescription.type,
        instructions: routine.instructions,
      });
    }
  
    const patientId = this.route.snapshot.paramMap.get('id');
    if (!patientId) {
      console.error('Patient ID is null');
      return; // Arrête l'exécution si patientId est null
    }
  
    dailyTasks.forEach((task) => {
      this.patientService.addPrescription(patientId, task).then(() => {
        console.log('Routine task added:', task);
      });
    });
   }

  onCancel(): void {
    this.dialogRef.close();
  }
}
