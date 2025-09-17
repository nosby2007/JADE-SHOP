import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/core/api.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({ selector:'app-patient-detail', templateUrl:'./patient-detail.component.html' })
export class PatientDetailComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  id = this.route.snapshot.paramMap.get('id')!;
  patient:any; wounds:any[]=[];
  form = new FormGroup({
    location: new FormControl(''),
    etiology: new FormControl<'pressure'|'diabetic'|'venous'|'arterial'|'surgical'|'trauma'|'other'>('pressure'),
    stage: new FormControl<'I'|'II'|'III'|'IV'|'DTPI'|'Unstageable'|undefined>(undefined)
  });

  ngOnInit(){
    this.api.getPatient(this.id).subscribe(r => this.patient = r);
    this.refreshWounds();
  }
  refreshWounds(){ this.api.listWoundsByPatient(this.id).subscribe((r:any)=> this.wounds = r); }
  createWound(){
    const body = { patientId: this.id, ...this.form.getRawValue() };
    this.api.createWound(body).subscribe(()=> this.refreshWounds());
  }
  pdf(woundId:string){ this.api.generateWoundReport(woundId).subscribe((r:any)=> window.open(r.downloadUrl, '_blank')); }
}
