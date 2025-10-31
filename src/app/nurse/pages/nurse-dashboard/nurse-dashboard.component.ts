import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NurseDataService } from '../../service/nurse-data.service';

@Component({
  selector: 'app-nurse-dashboard',
  templateUrl: './nurse-dashboard.component.html',
  styleUrls: ['./nurse-dashboard.component.scss']
})
export class NurseDashboardComponent implements OnInit {
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
