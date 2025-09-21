import { Component, OnInit, inject } from '@angular/core';

import { Patient } from '../../models/patient.model';
import { Observable } from 'rxjs';
import { NursePatientApiService } from '../../service/nurse-patient-api.service';

@Component({
  selector: 'app-nurse-patient-list',
  templateUrl: './nurse-patient-list.component.html',
  styleUrls: ['./nurse-patient-list.component.scss']
})
export class NursePatientListComponent implements OnInit {
  private api = inject(NursePatientApiService);

  items$!: Observable<Patient[]>;
displayed = ['id','name','gender','dob','phone','email','address','createdAt','actions'];

  q = '';

  ngOnInit(): void {
    this.items$ = this.api.list();
  }

  trackById = (_: number, p: Patient) => p.id!;

  // nurse-patient-list.component.ts
isFsTimestamp(v: any): boolean {
  return !!v && typeof v.toDate === 'function';
}
toJsDate(v: any): Date | null {
  if (!v) return null;
  if (this.isFsTimestamp(v)) return v.toDate();
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(+d) ? null : d;
}

}
