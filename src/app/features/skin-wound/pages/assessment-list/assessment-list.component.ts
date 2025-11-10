import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { WoundApiService } from 'src/app/core/wound-api.service';

type PatientDoc = {
  id?: string;
  displayName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  demographics?: { fullName?: string };
  userId?: string;
};

@Component({
  selector: 'app-assessment-list',
  templateUrl: './assessment-list.component.html',
  styleUrls: ['./assessment-list.component.scss']
})
export class AssessmentListComponent implements OnInit {
  patientId!: string;
  patientName$!: Observable<string>;
  items$!: Observable<any[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private afs: AngularFirestore,
    private api: WoundApiService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;

    // Load patient name from patients/{id}, fall back to users/{userId} if needed
    this.patientName$ = this.afs.doc<PatientDoc>(`patients/${this.patientId}`).valueChanges().pipe(
      switchMap(p => {
        if (!p) return of('(Unknown patient)');
        const localName =
          p.displayName ||
          p.name ||
          p.demographics?.fullName ||
          [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
        if (localName) return of(localName);

        // fallback: look up linked user profile
        if (p.userId) {
          return this.afs.doc<{ displayName?: string; firstName?: string; lastName?: string }>(`users/${p.userId}`)
            .valueChanges()
            .pipe(
              map(u =>
                (u?.displayName || [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() || '(Unnamed)')
              )
            );
        }
        return of('(Unnamed)');
      })
    );

    this.items$ = this.api.list(this.patientId);
  }

  newAssessment() {
    this.router.navigate(['/skin-wound', this.patientId, 'assessments', 'new']);
  }

  async remove(a: any) {
    if (!confirm('Supprimer cette évaluation ?')) return;
    await this.api.remove(this.patientId, a.id).toPromise();
    this.items$ = this.api.list(this.patientId); // refresh
  }
}
