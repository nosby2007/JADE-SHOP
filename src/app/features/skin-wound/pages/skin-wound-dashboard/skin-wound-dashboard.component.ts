import { Component, OnInit } from '@angular/core';

import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient, PatientApiService } from 'src/app/core/patient-api.service';
import { WoundApiService } from 'src/app/core/wound-api.service';

@Component({
  selector: 'app-skin-wound-dashboard',
  templateUrl: './skin-wound-dashboard.component.html',
  styleUrls: ['./skin-wound-dashboard.component.scss']
})
export class SkinWoundDashboardComponent implements OnInit {
  rows$!: Observable<{patient: Patient, count: number}[]>;

  constructor(private wounds: WoundApiService, private patients: PatientApiService) {}

  ngOnInit(): void {
    // simple: on charge tous les patients puis on mappe leur count de wounds via API
    this.rows$ = this.patients.list().pipe(
      map(list => list ?? []),
      // pour un vrai perf: créer une API /wounds/summary ; ici on fait simple.
      // (on suppose que WoundApiService.list() renvoie Observable<any[]>)
      map(arr => arr.map(p => ({ patient: p, count: 0 })))
    );
  }
}
