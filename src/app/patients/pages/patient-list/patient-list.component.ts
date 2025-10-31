import { Component, OnInit } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Patient, PatientApiService } from 'src/app/core/patient-api.service';
import { PatientService } from 'src/app/service/patient.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  displayed = ['name','phone','email','actions'];
  rows$!: Observable<Patient[]>;
  useApi = !!environment.apiBase;

  constructor(private api: PatientApiService, private fs: PatientService) {}

  ngOnInit(): void {
    this.rows$ = this.useApi
      ? this.api.list().pipe(catchError(() => of([])))
      : this.fs.list().pipe(catchError(() => of([])));
  }

  async remove(p: Patient) {
    if (!p.id) return;
    if (!confirm(`Supprimer ${p.name} ?`)) return;
    if (this.useApi) this.api.remove(p.id).subscribe(() => this.ngOnInit());
    else await this.fs.remove(p.id), this.ngOnInit();
  }
}
