// src/app/patients/pages/patient-form/patient-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PatientApiService } from 'src/app/core/patient-api.service';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  useApi = !!environment.apiBase;
  id?: string;

  // ✅ dob en Date | null (au lieu de string)
  form = this.fb.group({
    name: ['', Validators.required],
    gender: [''],
    dob: [null as Date | null],
    phone: [''],
    email: [''],
    address: [''],
    quartier: [''],
    departement: [''],
    docteur: [''],
    raison: [''],
    paiement: ['']
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: PatientApiService,
    private fs: PatientService,
    private afAuth: AngularFireAuth,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.id) {
      const load$ = this.useApi ? this.api.get(this.id) : this.fs.get(this.id);
      (load$ as any).subscribe((p: any) => {
        if (!p) return;
        this.form.patchValue({
          name: p?.name ?? '',
          gender: p?.gender ?? '',
          // ✅ normalise en Date pour le contrôle
          dob: this.toSafeDate(p?.dob),
          phone: p?.phone ?? '',
          email: p?.email ?? '',
          address: p?.address ?? '',
          quartier: p?.quartier ?? '',
          departement: p?.departement ?? '',
          docteur: p?.docteur ?? '',
          raison: p?.raison ?? '',
          paiement: p?.paiement ?? ''
        });
      });
    }
  }

  /** Convertit Timestamp/seconds/ISO/Date -> Date | null */
  private toSafeDate(input: any): Date | null {
    if (!input) return null;
    if (typeof input?.toDate === 'function') { try { return input.toDate(); } catch { return null; } }
    if (typeof input?.seconds === 'number') { try { return new Date(input.seconds * 1000); } catch { return null; } }
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
    if (typeof input === 'string') {
      const d = new Date(input);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  async submit() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    // nettoie null -> undefined
    const nn = <T extends Record<string, any>>(o: T) => {
      const out: any = {};
      for (const k of Object.keys(o)) out[k] = (o as any)[k] === null ? undefined : (o as any)[k];
      return out as { [K in keyof T]: Exclude<T[K], null> | undefined };
    };

    const data = nn(raw) as Partial<import('src/app/patient.model').Patient>;
    data.name = (raw.name ?? '').toString();

    // 🎯 Sortie selon la cible
    const dobDate = raw.dob ? this.toSafeDate(raw.dob) : null;
    if (this.useApi) {
      // API: ISO string (backend convertira si besoin)
      (data as any).dob = dobDate ? dobDate.toISOString() : undefined;
    } else {
      // Firestore direct: un Date (compat sait le sérialiser)
      (data as any).dob = dobDate ?? undefined;
    }

    if (!this.id) {
      // CREATE
      if (this.useApi) {
        this.api.create(data).subscribe(({ id }) => this.router.navigate(['/patients', id]));
      } else {
        // ✅ Les métadonnées seront ajoutées dans PatientService.create (voir patch 2)
        const ref = await this.fs.create(data as any);
        this.router.navigate(['/patients', (await ref).id]);
      }
    } else {
      // UPDATE
      if (this.useApi) {
        // Optionnel: envoyer updatedAt ISO pour cohérence
        this.api.update(this.id, { ...data, updatedAt: new Date().toISOString() } as any)
          .subscribe(() => this.router.navigate(['/patients', this.id!]));
      } else {
        // ✅ updatedAt sera ajouté dans PatientService.update (voir patch 2)
        await this.fs.update(this.id, data as any);
        this.router.navigate(['/patients', this.id!]);
      }
    }
  }
}
