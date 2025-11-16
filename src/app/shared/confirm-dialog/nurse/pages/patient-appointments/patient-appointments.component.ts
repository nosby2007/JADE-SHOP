import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { AppointmentDoc, AppointmentService, ApptStatus } from '../appointment.service';

@Component({
       selector: 'patient-appointments',
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.scss']
})
export class PatientAppointmentsComponent implements OnChanges {
  @Input() patientId!: string;
  @Input() patientName: string | null = null;

  appts$: Observable<AppointmentDoc[]> = of([]);
  loading = false;
  error = '';

  form = this.fb.group({
    date: ['', Validators.required],
    time: ['', Validators.required],
    reason: [''],
    notes: [''],
  });

  constructor(
    private fb: FormBuilder,
    private appt: AppointmentService,
    private dialog: MatDialog
  ) {}

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.patientId) {
      this.appts$ = this.appt.appointmentsForPatient$(this.patientId);
    }
  }

  /** Opens the full-screen dialog to manage appointments for this patient */
  openDialog(): void {
    this.dialog.open(AppointmentDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: {
        patientId: this.patientId,
        patientName: this.patientName ?? null,
      },
    });
  }

  async add(): Promise<void> {
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
      console.error('[PatientAppointments] add error:', e);
    } finally {
      this.loading = false;
    }
  }

  async setStatus(a: AppointmentDoc, status: ApptStatus): Promise<void> {
    this.error = '';
    this.loading = true;
    try {
      await this.appt.setStatus(a.id!, status);
    } catch (e: any) {
      this.error = e?.message || String(e);
      console.error('[PatientAppointments] setStatus error:', e);
    } finally {
      this.loading = false;
    }
  }

  async remove(a: AppointmentDoc): Promise<void> {
    if (!a?.id) return;
    this.error = '';
    this.loading = true;
    try {
      await this.appt.deleteAppointment(a.id);
    } catch (e: any) {
      this.error = e?.message || String(e);
      console.error('[PatientAppointments] delete error:', e);
    } finally {
      this.loading = false;
    }
  }

  trackById(_ix: number, x: AppointmentDoc) { return x.id; }
}
