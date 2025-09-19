import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WoundAssessmentService } from 'src/app/SERVICE/wound-assessment.service'; // Firestore direct
import { Observable } from 'rxjs';

@Component({
  selector: 'app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.scss']
})
export class AssessmentDetailComponent implements OnInit {
  patientId!: string;
  assessmentId!: string;
  item$!: Observable<any | undefined>;

  constructor(private route: ActivatedRoute, private fsSvc: WoundAssessmentService) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.assessmentId = this.route.snapshot.paramMap.get('assessmentId')!;
    this.item$ = this.fsSvc.get(this.patientId, this.assessmentId);
  }
}
