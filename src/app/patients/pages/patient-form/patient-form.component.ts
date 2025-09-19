import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  form = this.fb.group({
    name: ['', Validators.required],
    gender: [''],
    dob: [''],
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
    private fs: PatientService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.id) {
      const load$ = this.useApi ? this.api.get(this.id) : this.fs.get(this.id);
      (load$ as any).subscribe((p: any) => {
        if (!p) return;
        this.form.patchValue({
          name: p.name ?? '',
          gender: p.gender ?? '',
          dob: p.dob ?? '',
          phone: p.phone ?? '',
          email: p.email ?? '',
          address: p.address ?? '',
          quartier: p.quartier ?? '',
          departement: p.departement ?? '',
          docteur: p.docteur ?? '',
          raison: p.raison ?? '',
          paiement: p.paiement ?? ''
        });
      });
    }
  }

  async submit() {
    const raw = this.form.getRawValue();
  
    // helper: remplace null -> undefined
    const nn = <T extends Record<string, any>>(o: T): { [K in keyof T]: Exclude<T[K], null> | undefined } => {
      const out: any = {};
      Object.keys(o).forEach(k => {
        const v = (o as any)[k];
        out[k] = (v === null ? undefined : v);
      });
      return out;
    };
  
    // on nettoie + on s'assure que name est une string
    const data = nn(raw) as Partial<import('src/app/patient.model').Patient>;
    data.name = (raw.name ?? '').toString();
  
    if (!this.id) {
      // create
      if (this.useApi) {
        this.api.create(data).subscribe(({ id }) => this.router.navigate(['/patients', id]));
      } else {
        const ref = await this.fs.create(data);
        this.router.navigate(['/patients', (await ref).id]);
      }
    } else {
      // update
      if (this.useApi) {
        this.api.update(this.id, data).subscribe(() => this.router.navigate(['/patients', this.id]));
      } else {
        await this.fs.update(this.id, data);
        this.router.navigate(['/patients', this.id]);
      }
    }
  }
  
}
