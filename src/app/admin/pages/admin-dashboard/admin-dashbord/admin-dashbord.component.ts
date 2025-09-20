import { Component, inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map, combineLatest } from 'rxjs';

@Component({
  selector: 'app-admin-dashbord',
  templateUrl: './admin-dashbord.component.html',
  styleUrls: ['./admin-dashbord.component.scss']
})
export class AdminDashbordComponent implements OnInit {

  private afs = inject(AngularFirestore);

  kpi$!: Observable<{ patients: number; assessments: number; users: number }>;
  lastAssessments$!: Observable<any[]>;

  ngOnInit(): void {
    const patients$ = this.afs.collection('patients').valueChanges({ idField: 'id' }).pipe(map(a => a.length));
    const users$ = this.afs.collection('users').valueChanges({ idField: 'id' }).pipe(map(a => a.length));
    const assessments$ = this.afs.collectionGroup('woundAssessments').valueChanges({ idField: 'id' }).pipe(map(a => a.length));

    this.kpi$ = combineLatest([patients$, assessments$, users$]).pipe(
      map(([patients, assessments, users]) => ({ patients, assessments, users }))
    );

    this.lastAssessments$ = this.afs.collectionGroup('woundAssessments', ref => ref
      .orderBy('createdAt', 'desc').limit(10)
    ).snapshotChanges().pipe(
      map(snaps => snaps.map(s => ({ id: s.payload.doc.id, ...(s.payload.doc.data() as any) })))
    );
  }
}