import { Component, inject } from '@angular/core';
import { ApiService } from 'src/app/core/api.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';


@Component({ selector:'app-patients-list', templateUrl:'./patients-list.component.html' })
export class PatientsListComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  q = new FormControl('');
  patients:any[] = [];
  ngOnInit(){ this.search(); }
  search(){ this.api.listPatients(this.q.value ?? '').subscribe((r:any)=> this.patients = r); }
  open(p:any){ this.router.navigate(['/skin-wound/patient', p.id]); }
}
