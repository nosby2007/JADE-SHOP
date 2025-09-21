// src/app/nurse/pages/nurse-prescriptions/nurse-prescriptions.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Rx } from '../../models/patient.model';
import { NurseDataService } from '../../service/nurse-data.service';

@Component({
  selector: 'app-nurse-prescriptions',
  templateUrl: './nurse-prescriptions.component.html',
  styleUrls: ['./nurse-prescriptions.component.scss']
})
export class NursePrescriptionsComponent implements OnInit {
  patientId!: string;
  items$!: Observable<Rx[]>;
  loading = false;

  displayed = ['name','dose','route','frequency','startDate','endDate','notes','actions'];

  form = this.fb.group({
    name: ['', Validators.required],
    dose: [''],
    route: [''],
    frequency: [''],
    startDate: [null as Date | null],
    endDate: [null as Date | null],
    notes: [''],
  });

  constructor(
    private ar: ActivatedRoute,
    private fb: FormBuilder,
    private data: NurseDataService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.patientId = this.ar.snapshot.paramMap.get('id')!;
    this.items$ = this.data.listRx(this.patientId);
  }

  async addRx() {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      const payload = this.form.getRawValue();
      await this.data.addRx(this.patientId, payload as Partial<Rx>);
      this.snack.open('Prescription ajoutée', 'OK', { duration: 2000 });
      this.form.reset({ name: '', dose: '', route: '', frequency: '', startDate: null, endDate: null, notes: '' });
    } catch (e: any) {
      this.snack.open(`Erreur: ${e?.message || 'échec ajout'}`, 'Fermer', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  toDate(v: any): Date | null {
    if (!v) return null;
    if (v?.toDate) return v.toDate();
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }
}
