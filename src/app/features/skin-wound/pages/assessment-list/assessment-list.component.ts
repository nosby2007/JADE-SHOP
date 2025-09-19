import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { WoundApiService } from 'src/app/core/wound-api.service';

@Component({
  selector: 'app-assessment-list',
  templateUrl: './assessment-list.component.html',
  styleUrls: ['./assessment-list.component.scss']
})
export class AssessmentListComponent implements OnInit {
  patientId!: string;
  items$!: Observable<any[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: WoundApiService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.items$ = this.api.list(this.patientId);
  }

  newAssessment() {
    this.router.navigate(['/skin-wound', 'new', this.patientId]);
  }

  async remove(a: any) {
    if (!confirm('Supprimer cette évaluation ?')) return;
    await this.api.remove(this.patientId, a.id).toPromise();
    this.items$ = this.api.list(this.patientId); // refresh
  }
}
