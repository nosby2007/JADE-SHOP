import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';

@Component({
  selector: 'app-emar-details',
  templateUrl: './emar-details.component.html',
  styleUrls: ['./emar-details.component.scss']
})
export class EmarDetailsComponent implements OnInit {
  taskForm: FormGroup = this.fb.group({});
  tasks: any[] = []; // Toutes les tâches
  filteredTasks: any[] = []; // Tâches filtrées
  patientId: string | null = null;
  selectedDate: Date | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId) {
      this.loadTasks(this.patientId);
    } else {
      console.error('Patient ID introuvable.');
    }
  }

  // Charger les tâches depuis Firebase
  loadTasks(patientId: string): void {
    this.patientService.getPrescriptionsByPatient(patientId).subscribe(
      (tasks) => {
        this.tasks = tasks.map((task: any) => ({
          ...task,
          date: new Date(task.date) // Convertir les dates en objets Date
        }));
        this.filteredTasks = [...this.tasks];
        this.initializeForm();
      },
      (err) => console.error('Erreur lors du chargement des tâches:', err)
    );
  }

  // Initialiser les formulaires pour les tâches
  initializeForm(): void {
    this.tasks.forEach((task) => {
      this.taskForm.addControl(task.id, new FormControl(task.status || 'not-done'));
    });
  }

  // Filtrer les tâches par état
  filterTasks(filterType: string): void {
    const now = new Date();

    if (filterType === 'overdue') {
      this.filteredTasks = this.tasks.filter(
        (task) => task.date < now && task.status === 'not-done'
      );
    } else {
      this.resetFilter();
    }
  }

  // Filtrer par date
  onDateChange(event: any): void {
    this.selectedDate = event.value;

    if (this.selectedDate) {
      this.filteredTasks = this.tasks.filter((task) =>
        this.isSameDate(task.date, this.selectedDate!)
      );
    } else {
      this.resetFilter();
    }
  }

  // Comparer les dates
  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Réinitialiser les filtres
  resetFilter(): void {
    this.filteredTasks = [...this.tasks];
  }

  // Sauvegarder les modifications des tâches
  submitTaskUpdates(): void {
    if (!this.patientId) return;

    const updates = this.taskForm.value;
    Object.keys(updates).forEach((taskId) => {
      const updatedStatus = updates[taskId];
      this.patientService
        .updatePrescriptionStatus(this.patientId!, taskId, { status: updatedStatus })
        .then(() => console.log(`Tâche ${taskId} mise à jour avec succès.`))
        .catch((err) => console.error(`Erreur lors de la mise à jour de la tâche ${taskId}:`, err));
    });
  }

  // Retourner à la page précédente
  goBack(): void {
    this.router.navigate(['/emar']);
  }

  // Ajouter des classes CSS pour le style des tâches
  getTaskClass(task: any): string {
    if (task.status === 'done') return 'task-done';
    if (task.date < new Date() && task.status === 'not-done') return 'task-overdue';
    return 'task-pending';
  }
}
