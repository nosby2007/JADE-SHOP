import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PatientService } from 'src/app/service/patient.service';

@Component({
  selector: 'app-reception-dashboard',
  templateUrl: './reception-dashboard.component.html',
  styleUrls: ['./reception-dashboard.component.scss']
})
export class ReceptionDashboardComponent implements OnInit {



    totalPatients$!: Observable<number>;
    openTasks$!: Observable<number>;
    recentTasks$!: Observable<any[]>;

    constructor(private nurseSvc: PatientService) {}

    ngOnInit() {
      // Exemple : compter les patients
      this.totalPatients$ = this.nurseSvc.list().pipe(
        map(arr => arr.length)
      );
  
     
      // Exemple : 5 dernières tâc
    }

}
