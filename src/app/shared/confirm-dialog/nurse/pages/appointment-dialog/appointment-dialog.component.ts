import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { AppointmentDoc, ApptStatus, AppointmentService } from '../appointment.service';


export interface AppointmentDialogData {
  patientId: string;
  patientName?: string | null;
}

@Component({
  selector: 'app-appointment-dialog',
  templateUrl: './appointment-dialog.component.html',
})
export class AppointmentDialogComponent implements OnInit {
  patientId!: string;
  patientName: string | null = null;

  appts$: Observable<AppointmentDoc[]> = of([]);
  loading = false;
  error = '';

  form = this.fb.group({
    date: ['', Validators.required],  // <input type="date">
    time: ['', Validators.required],  // <input type="time">
    reason: [''],
    notes: [''],
  });

  readonly statuses: ApptStatus[] = ['scheduled','checked_in','completed','cancelled','no_show'];

  constructor(
    private fb: FormBuilder,
    private appt: AppointmentService,
    private ref: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: AppointmentDialogData
  ) {
    this.patientId = data.patientId;
    this.patientName = data.patientName ?? null;
  }

  ngOnInit(): void {
    this.appts$ = this.appt.appointmentsForPatient$(this.patientId);
  }

  async create(): Promise<void> {
    this.error = '';
    if (this.form.invalid) return;

    const dateStr = this.form.value.date as string;
    const timeStr = this.form.value.time as string;
    const dt = new Date(dateStr);
    const [h, m] = (timeStr || '00:00').split(':').map(n => Number(n));
    dt.setHours(h || 0, m || 0, 0, 0);

    this.loading = true;
    try {
      await this.appt.createAppointment({
        patientId: this.patientId,
        patientName: this.patientName ?? null,
        date: dt,
        reason: (this.form.value.reason || null),
        notes: (this.form.value.notes || null),
        status: 'scheduled',
      });
      this.form.reset({ date: '', time: '', reason: '', notes: '' });
    } catch (e: any) {
      this.error = e?.message || String(e);
      console.error('[AppointmentDialog] create error:', e);
    } finally {
      this.loading = false;
    }
  }

  async changeStatus(a: AppointmentDoc, status: ApptStatus): Promise<void> {
    this.error = '';
    this.loading = true;
    try {
      await this.appt.setStatus(a.id!, status);
    } catch (e: any) {
      this.error = e?.message || String(e);
      console.error('[AppointmentDialog] setStatus error:', e);
    } finally {
      this.loading = false;
    }
  }

  async delete(a: AppointmentDoc): Promise<void> {
    if (!a?.id) return;
    this.error = '';
    this.loading = true;
    try {
      await this.appt.deleteAppointment(a.id);
    } catch (e: any) {
      this.error = e?.message || String(e);
      console.error('[AppointmentDialog] delete error:', e);
    } finally {
      this.loading = false;
    }
  }

  trackById(_ix: number, a: AppointmentDoc) { return a.id; }

  close(): void { this.ref.close(); }
}
