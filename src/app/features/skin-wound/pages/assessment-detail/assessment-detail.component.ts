import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { WoundAssessmentService } from 'src/app/service/wound-assessment.service';



@Component({
  selector: 'app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.scss']
})
export class AssessmentDetailComponent implements OnInit {
  patientId!: string;
  assessmentId!: string;
  item$!: Observable<any | undefined>;
  public afAuth = inject(AngularFireAuth);

  constructor(private route: ActivatedRoute, private fsSvc: WoundAssessmentService) {}
  public idTokenResult$ = this.afAuth.idTokenResult;
  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.assessmentId = this.route.snapshot.paramMap.get('assessmentId')!;
    this.item$ = this.fsSvc.get(this.patientId, this.assessmentId);
  }
}
