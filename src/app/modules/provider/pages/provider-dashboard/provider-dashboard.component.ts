import { Component, OnInit } from '@angular/core';


import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NurseDataService } from 'src/app/nurse/service/nurse-data.service';


@Component({
  selector: 'app-provider-dashboard',
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit {

 totalPatients$!: Observable<number>;
   openTasks$!: Observable<number>;
   recentTasks$!: Observable<any[]>;
 
   constructor(private nurseSvc: NurseDataService) {}
 
   ngOnInit() {
     // Exemple : compter les patients
     this.totalPatients$ = this.nurseSvc.listAllPatients().pipe(
       map(arr => arr.length)
     );
 
     // Exemple : compter les tâches ouvertes
     this.openTasks$ = this.nurseSvc.listAllTasks().pipe(
       map(arr => arr.filter(t => !t.completed).length)
     );
 
     // Exemple : 5 dernières tâches
     this.recentTasks$ = this.nurseSvc.listAllTasks().pipe(
       map(arr => arr.slice(0, 5))
     );
   }

}
