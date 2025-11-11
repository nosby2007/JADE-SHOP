import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import firebase from 'firebase/compat/app';
import { PatientService } from 'src/app/service/patient.service';

@Component({
  selector: 'app-emar-details',
  templateUrl: './emar-details.component.html',
  styleUrls: ['./emar-details.component.scss']
})
export class EmarDetailsComponent implements OnInit {
 taskForm: FormGroup = this.fb.group({});
  tasks: any[] = [];
  filteredTasks: any[] = [];
  patientId!: string;
  selectedDate: Date | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) {}

 ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  if (!id) {
    // Don’t return the promise from ngOnInit; just trigger navigation
    void this.router.navigate(['/emar']);
    return;
  }

  this.patientId = id;

  this.patientService.getPrescriptionsByPatient(id).subscribe(items => {
    this.tasks = (items || []).map((t: any) => ({
      ...t,
      date: this.toDate(t.date),
      dueAt: this.toDate(t.dueAt),
    }));
    this.filteredTasks = [...this.tasks];
    this.initializeForm();
  });
}

/** Handles Firestore Timestamp, epoch seconds, ISO strings, Date, etc. */
 toDate(v: any): Date | null {
  if (!v) return null;
  if (typeof v?.toDate === 'function') return v.toDate();           // Firestore Timestamp
  if (typeof v === 'object' && typeof v.seconds === 'number') {
    return new Date(v.seconds * 1000);                               // {seconds, nanoseconds}
  }
  const d = new Date(v);
  return Number.isNaN(+d) ? null : d;
}


  initializeForm() {
    this.taskForm = this.fb.group({});
    this.tasks.forEach(t => this.taskForm.addControl(
      t.id, new FormControl(t.status || 'not-done')
    ));
  }

  filterTasks(type: 'overdue' | 'all' | string) {
    if (type === 'overdue') {
      const now = new Date();
      this.filteredTasks = this.tasks.filter(t =>
        (t.dueAt || t.date) && (t.status || 'not-done') !== 'done' && (t.dueAt || t.date).getTime() < now.getTime()
      );
    } else {
      this.resetFilter();
    }
  }

  onDateChange(e: any) {
    this.selectedDate = e.value;
    if (!this.selectedDate) return this.resetFilter();
    const y = this.selectedDate.getFullYear();
    const m = this.selectedDate.getMonth();
    const d = this.selectedDate.getDate();
    this.filteredTasks = this.tasks.filter(t => {
      const dt: Date = t.dueAt || t.date;
      return dt && dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    });
  }

  resetFilter() { this.filteredTasks = [...this.tasks]; }

  submitTaskUpdates() {
    if (!this.patientId) return;
    const updates = this.taskForm.value;
    Object.keys(updates).forEach(taskId => {
      const status = updates[taskId];
      this.patientService.updatePrescriptionStatus(this.patientId, taskId, {
        status,
        administeredAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
  }

  goBack() { this.router.navigate(['/emar']); }

  getTaskClass(t: any) {
    if ((t.status || '') === 'done') return 'task-done';
    const dt: Date = t.dueAt || t.date;
    if (dt && dt.getTime() < Date.now() && (t.status || 'not-done') !== 'done') return 'task-overdue';
    return 'task-pending';
  }
}