import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NurseDataService } from '../../service/nurse-data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nurse-tasks',
  templateUrl: './nurse-tasks.component.html',
  styleUrls: ['./nurse-tasks.component.scss']
})
export class NurseTasksComponent implements OnInit {
  // Assure que le form est créé immédiatement
  form = this.fb.group({
    newTask: this.fb.group({
      title: ['', Validators.required],
      notes: [''],
      dueAt: [null],
      priority: ['normal'],
      assignedTo: [''],
      repeat: this.fb.group({
        enabled: [false],
        interval: [1],
        unit: ['week'],
        startDate: [null]
      })
    }),
    tasks: this.fb.array([]) // si tu affiches une liste éditable
  });

  loading = false;
  patientId?: string;

  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private snack: MatSnackBar,
    private nurseData: NurseDataService,
    private ar: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // si tu récupères patientId via route snapshot/parent input, fais-le ici
    // this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.patientId =
    this.ar.snapshot.paramMap.get('id') ||
    this.ar.snapshot.paramMap.get('pid') ||
    this.ar.parent?.snapshot.paramMap.get('id') ||
    this.ar.parent?.snapshot.paramMap.get('pid') ||
    undefined;

  // au cas où la route charge plus tard (lazy), on subscribe aussi :
  if (!this.patientId) {
    this.ar.paramMap.subscribe(pm => {
      this.patientId =
        pm.get('id') ||
        pm.get('pid') ||
        this.ar.parent?.snapshot.paramMap.get('id') ||
        this.ar.parent?.snapshot.paramMap.get('pid') ||
        undefined;
      console.log('[NurseTasks] patientId from params =', this.patientId);
    });
  }

  console.log('[NurseTasks] patientId init =', this.patientId);
}

  get tasksFA(): FormArray {
    return this.form.get('tasks') as FormArray;
  }
  get newTaskFG(): FormGroup {
    return this.form.get('newTask') as FormGroup;
  }
  get repeatFG(): FormGroup {
    return this.newTaskFG.get('repeat') as FormGroup;
  }

  get currentUserUid(): string | null {
    return firebase.auth().currentUser?.uid || null;
  }

  private stripUndefinedDeep<T>(val: T): T {
    if (Array.isArray(val)) return val.map(v => this.stripUndefinedDeep(v)) as any;
    if (val && typeof val === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(val as any)) {
        if (v !== undefined) out[k] = this.stripUndefinedDeep(v as any);
      }
      return out;
    }
    return val;
  }

  private sanitizeRepeat(raw: any): any {
    if (!raw) return { enabled: false };
    const enabled = !!raw.enabled;
    if (!enabled) return { enabled: false };
    const interval = Number(raw.interval);
    const unit = (raw.unit || '') as 'day'|'week'|'month'|'year';
    if (!interval || interval < 1 || !unit) return { enabled: false };
    return this.stripUndefinedDeep({
      enabled: true,
      interval,
      unit,
      startDate: raw.startDate ?? undefined
    });
  }

  async createTask() {
    if (!this.patientId) {
      this.snack.open('Patient manquant', 'OK', { duration: 3000 });
      return;
    }
    if (this.newTaskFG.invalid) {
      this.snack.open('Formulaire incomplet', 'OK', { duration: 3000 });
      return;
    }
  
    this.loading = true;
    const raw = this.newTaskFG.getRawValue();
    try {
      const id = await this.nurseData.addTask(this.patientId, raw);
      this.snack.open('Tâche créée ✅', 'OK', { duration: 2000 });
      console.log('[createTask] New task id=', id);
  
      // reset propre
      this.newTaskFG.reset({
        title: '',
        notes: '',
        dueAt: null,
        priority: 'normal',
        assignedTo: '',
        repeat: { enabled: false, interval: 1, unit: 'week', startDate: null }
      });
    } catch (e: any) {
      console.error('[createTask] ERREUR', e);
      this.snack.open(`Erreur: ${e?.message || e}`, 'Fermer', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }
}
