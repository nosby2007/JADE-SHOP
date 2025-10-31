// src/app/nurse/pages/nurse-patient-detail/nurse-patient-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { NurseDataService } from '../../service/nurse-data.service';
import { Patient } from '../../models/patient.model';



@Component({
  selector: 'app-nurse-patient-detail',
  templateUrl: './nurse-patient-detail.component.html',
  styleUrls: ['./nurse-patient-detail.component.scss']
})
export class NursePatientDetailComponent implements OnInit {
  patientId!: string;
  patient$!: Observable<any>;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private data: NurseDataService,
    private router: Router

  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    // Si ton service expose getPatient :
    const obs = this.data.getPatient ? this.data.getPatient(this.patientId) : of(null);
    this.patient$ = obs;
    // tu peux brancher un finalize() dans le service ; ici simple délestage :
    setTimeout(() => (this.loading = false), 50);
  }

  toDate(v: any): Date | null {
    if (!v) return null;
    if (v?.toDate) return v.toDate();
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }
   gotoWounds(p: Patient) {
       this.router.navigate(['/skin-wound', p.id, 'assessments']);
     }
}
