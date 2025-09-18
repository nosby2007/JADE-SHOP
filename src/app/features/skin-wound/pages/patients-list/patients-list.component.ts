import { Component, inject } from '@angular/core';
import { ApiService } from 'src/app/core/api.service';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WoundAssessment } from 'src/app/models/wound-assessment.model';
import { WoundAssessmentService } from 'src/app/SERVICE/wound-assessment.service';


@Component({ selector:'app-patients-list', templateUrl:'./patients-list.component.html' })
export class PatientsListComponent {
   patientId!: string;
   data$!: Observable<WoundAssessment[]>;
   displayed = ['createdAt','type','stage','location','size','status','actions'];
 
   constructor(private ar: ActivatedRoute, private svc: WoundAssessmentService, private router: Router) {}
 
   ngOnInit(): void {
     this.patientId = this.ar.snapshot.paramMap.get('id')!;
     this.data$ = this.svc.list(this.patientId);
   }
 
   newAssessment() {
     this.router.navigate(['/patients', this.patientId, 'wounds', 'new']);
   }
 
   open(a: WoundAssessment) {
     this.router.navigate(['/patients', this.patientId, 'wounds', a.id]);
   }
 
   size(a: WoundAssessment) { return `${a.measurements.length}×${a.measurements.width}×${a.measurements.depth} cm`; }
 
   delete(a: WoundAssessment) {
     if (a.id) this.svc.remove(this.patientId, a.id);
   }
}
