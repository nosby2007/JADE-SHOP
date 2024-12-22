import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-emar-details',
  templateUrl: './emar-details.component.html',
  styleUrls: ['./emar-details.component.scss']
})
export class EmarDetailsComponent implements OnInit {
  taskForm: FormGroup; // Holds form controls for tasks
  tasks: any[] = []; // Array to hold all tasks fetched from Firebase
  filteredTasks: any[] = []; // Array to hold tasks based on filtering
  patientId: string | null = null; // Patient ID from route
  loading: boolean = false; // Indicator for loading state
  error: string | null = null; // Holds error messages

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {
    this.taskForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId) {
      this.loadTasks(this.patientId);
    } else {
      this.error = 'No patient ID found in route.';
    }
  }

  // Fetch tasks from Firebase
  loadTasks(patientId: string): void {
    this.loading = true;
    this.patientService.getPrescriptionsByPatient(patientId).subscribe(
      (tasks) => {
        this.tasks = tasks.map((task: any) => ({
          id: task.id,
          medication: task.medication,
          routine: task.routine,
          route: task.route,
          time: task.time,
          status: task.status || 'not-done',
        }));
        this.filteredTasks = [...this.tasks];
        this.initializeForm();
        this.loading = false;
      },
      (err) => {
        console.error('Error fetching tasks:', err);
        this.error = 'Unable to load tasks. Please try again.';
        this.loading = false;
      }
    );
  }

  // Initialize form controls for each task
  initializeForm(): void {
    this.tasks.forEach((task) => {
      this.taskForm.addControl(task.id, new FormControl(task.status));
    });
  }

  // Filter tasks by category
  filterTasks(filterType: string): void {
    if (filterType === 'overdue') {
      this.filteredTasks = this.tasks.filter((task) => this.isOverdue(task));
    } else if (filterType === 'now') {
      this.filteredTasks = this.tasks.filter((task) => this.isDueNow(task));
    } else if (filterType === 'shift') {
      this.filteredTasks = this.tasks.filter((task) => this.isShiftTask(task));
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }

  resetFilter(): void {
    this.filteredTasks = [...this.tasks];
  }

  // Determine overdue tasks
  isOverdue(task: any): boolean {
    const taskTime = new Date(task.time).getTime();
    const now = new Date().getTime();
    return taskTime < now && task.status === 'not-done';
  }

  // Determine tasks due now
  isDueNow(task: any): boolean {
    const taskTime = new Date(task.time).getTime();
    const now = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000;
    return Math.abs(taskTime - now) <= tenMinutes;
  }

  // Determine shift tasks
  isShiftTask(task: any): boolean {
    // Customize shift logic here
    return true; // Example: All tasks are considered shift tasks
  }

  // Handle task updates
  submitTaskUpdates(): void {
    if (!this.patientId) return;
    const updates = this.taskForm.value;

    Object.keys(updates).forEach((taskId) => {
      const updatedStatus = updates[taskId];
      this.patientService
        .updatePrescriptionStatus(this.patientId!, taskId, { status: updatedStatus })
        .then(() => {
          console.log(`Task ${taskId} updated to ${updatedStatus}`);
        })
        .catch((err) => {
          console.error(`Failed to update task ${taskId}:`, err);
        });
    });
  }

  // Get CSS class for task cards
  getTaskClass(task: any): string {
    if (task.status === 'done') return 'task-done';
    if (this.isOverdue(task)) return 'task-overdue';
    return 'task-pending';
  }
}
