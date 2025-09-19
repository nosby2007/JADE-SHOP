import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Patient } from 'src/app/patient.model';
import { PatientApiService } from 'src/app/core/patient-api.service';
import { PatientService } from 'src/app/SERVICE/patient.service';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  patientId!: string;
  patient$!: Observable<Patient | null>;
  useApi = !!environment.apiBase;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: PatientApiService,
    private fs: PatientService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.patient$ = this.useApi
      ? (this.api.get(this.patientId) as Observable<Patient>).pipe(catchError(() => of(null)))
      : (this.fs.get(this.patientId) as Observable<Patient | undefined>).pipe(
          catchError(() => of(undefined)),
          // normaliser en null
          (src) => new Observable<Patient | null>(obs => src.subscribe(v => obs.next(v ?? null)))
        );
  }

  gotoWounds(p: Patient) {
    this.router.navigate(['/skin-wound', p.id, 'assessments']);
  }
}
