import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { WoundApiService } from 'src/app/core/wound-api.service';
import { map, switchMap } from 'rxjs/operators';
import { NgIfContext } from '@angular/common';

@Component({
  selector: 'app-skin-wound',
  templateUrl: './skin-wound.component.html',
  styleUrls: ['./skin-wound.component.scss']
})
export class SkinWoundComponent implements OnInit {

   patientId!: string;
  items$!: Observable<any[]>;
empty!: TemplateRef<NgIfContext<number>>|null;
patient: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: WoundApiService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.refresh();
  }

  refresh() {
    this.items$ = this.api.list(this.patientId);
  }

  async remove(a: any) {
    if (!confirm('Supprimer cette évaluation ?')) return;
    await this.api.remove(this.patientId, a.id).toPromise();
    this.refresh();
  }

  newAssessment() {
    this.router.navigate(['/skin-wound', 'new', this.patientId]);
  }

  assessments$ = this.route.paramMap.pipe(
    map(p => p.get('id')!),
    switchMap(patientId => this.api.list(patientId))
  );
}
