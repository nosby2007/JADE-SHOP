import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Patient } from 'src/app/nurse/models/patient.model';
import { NurseDataService } from 'src/app/nurse/service/nurse-data.service';

@Component({
  selector: 'app-provider-detail',
  templateUrl: './provider-detail.component.html',
  styleUrls: ['./provider-detail.component.scss']
})
export class ProviderDetailComponent implements OnInit {
  patientId!: string;
  patient$!: Observable<Patient | null>;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private data: NurseDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.patient$ = this.data.getPatient ? this.data.getPatient(this.patientId) : of(null);
    setTimeout(() => (this.loading = false), 50);
  }

  toDate(v: any): Date | null {
    if (!v) return null;
    if (v?.toDate) return v.toDate();
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }

  gotoWounds(p: Patient | null) {
    const id = p?.id || this.patientId;
    if (id) this.router.navigate(['/skin-wound', id, 'assessments']);
  }
}
