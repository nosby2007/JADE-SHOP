import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PageEvent } from '@angular/material/paginator';
import { PatientService } from 'src/app/service/patient.service';

type PatientCard = {
  id: string;
  name: string;
  location?: string;
  room?: string;
  prescriptions?: any[];
  prescriptionsCount?: number;
  overdueCount?: number;
  hasOverdue?: boolean;
  allergies?: string[];
  codeStatus?: string;
};

@Component({
 selector: 'app-emar-list',
  templateUrl: './emar-list.component.html',
  styleUrls: ['./emar-list.component.scss']
})
export class EmarListComponent implements OnInit {
  patients: PatientCard[] = [];
  filtered: PatientCard[] = [];
  pageSlice: PatientCard[] = [];
  search = '';

  pageSize = 12;
  pageIndex = 0;

  constructor(private patientService: PatientService, private router: Router) {}

  ngOnInit(): void {
    this.patientService.getPatients().subscribe(data => {
      // Normalize for the view
      this.patients = (data || []).map((p: any) => {
        const prescriptions = p.prescriptions || [];
        const overdue = prescriptions.filter((x: any) => this.isOverdue(x)).length;
        return {
          id: p.id,
          name: p.name || `${p.lastName ?? ''} ${p.firstName ?? ''}`.trim(),
          location: p.location,
          room: p.room,
          prescriptions,
          prescriptionsCount: prescriptions.length,
          overdueCount: overdue,
          hasOverdue: overdue > 0,
          allergies: p.clinical?.allergies || p.allergies,
          codeStatus: p.clinical?.codeStatus || p.codeStatus,
        } as PatientCard;
      });

      this.filtered = [...this.patients];
      this.updateSlice();
    });
  }

  onSearch(ev: Event) {
    this.search = (ev.target as HTMLInputElement).value.trim().toLowerCase();
    this.filtered = this.patients.filter(p =>
      [p.name, p.location, p.room].some(v => (v || '').toLowerCase().includes(this.search))
    );
    this.pageIndex = 0;
    this.updateSlice();
  }

  clearSearch() {
    this.search = '';
    this.filtered = [...this.patients];
    this.pageIndex = 0;
    this.updateSlice();
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.updateSlice();
  }

  updateSlice() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pageSlice = this.filtered.slice(start, end);
  }

  viewTasks(patientId: string) {
    this.router.navigate(['/emar', 'emar', patientId]);
  }

  getCardClass(p: PatientCard) {
    // fix: your old code used `> 0 + 1`
    const hasRx = (p.prescriptionsCount ?? 0) > 0;
    return {
      'has-prescriptions': hasRx,
      'no-prescriptions' : !hasRx,
      'has-overdue'      : !!p.hasOverdue,
    };
  }

  initials(name: string) {
    return (name || '—')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase())
      .join('');
  }

  private isOverdue(rx: any): boolean {
    const status = (rx?.status || '').toLowerCase();
    const when = this.toDate(rx?.dueAt || rx?.date);
    return status !== 'done' && !!when && when.getTime() < Date.now();
  }

  private toDate(v: any): Date | null {
    if (!v) return null;
    // Firestore Timestamp
    // @ts-ignore
    if (typeof v?.toDate === 'function') return v.toDate();
    const d = new Date(v);
    return isNaN(+d) ? null : d;
    }
}
