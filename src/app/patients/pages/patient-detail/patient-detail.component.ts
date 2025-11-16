import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PatientApiService } from 'src/app/core/patient-api.service';
import { PatientService } from 'src/app/service/patient.service';
import { Location } from '@angular/common'; // ⬅️ add
import { Patient } from 'src/app/nurse/models/patient.model';
import { NurseDataService } from 'src/app/nurse/service/nurse-data.service';


@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
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
