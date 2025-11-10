import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from 'src/app/nurse/models/patient.model';
import { NursePatientApiService } from 'src/app/nurse/service/nurse-patient-api.service';

@Component({
  selector: 'app-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrls: ['./provider-list.component.scss']
})
export class ProviderListComponent implements OnInit {

  private api = inject(NursePatientApiService);
  
    items$!: Observable<Patient[]>;
  displayed = ['name','gender','dob','phone','address','admissionDate', 'paiement','raison','actions'];
  
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
