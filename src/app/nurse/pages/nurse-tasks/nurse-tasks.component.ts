import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PatientApiService } from 'src/app/core/patient-api.service';
import { PatientService } from 'src/app/service/patient.service';
import { Location } from '@angular/common'; // ⬅️ add
import { NurseDataService } from '../../service/nurse-data.service';
import { Patient, Rx } from '../../models/patient.model';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auth} from '@angular/fire/auth';

@Component({
  selector: 'app-nurse-tasks',
  templateUrl: './nurse-tasks.component.html',
  styleUrls: ['./nurse-tasks.component.scss']
})
export class NurseTasksComponent  {
  patientId!: string;
   patient$!: Observable<Patient | null>;
   useApi = !!environment.apiBase;
   loading = false;
  hidePw = true;
    items$!: Observable<Rx[]>;
    displayed = [
      'name','dose','route','frequency',
      'medicationType','medicationForm','prescriber',
      'startDate','endDate','notes','esign','actions'
    ];
 
   constructor(
     private route: ActivatedRoute,
     private router: Router,
     private api: PatientApiService,
     private fs: PatientService,
     private data: NurseDataService,
     private location: Location,
     private snack: MatSnackBar,
     private auth: Auth,
     private fb: FormBuilder,  
     
   ) {}
 
   ngOnInit(): void {
     this.patientId = this.route.snapshot.paramMap.get('id')!;
     this.patient$ = this.useApi
       ? (this.api.get(this.patientId) as Observable<Patient>).pipe(catchError(() => of(null)))
       : (this.fs.get(this.patientId) as Observable<Patient | undefined>).pipe(
           catchError(() => of(undefined)),
           // normaliser en null
           (src) => new Observable<Patient | null>(obs => src.subscribe(v => obs.next(v ?? null)))
         );
         this.patientId = this.route.snapshot.paramMap.get('id')!;
     this.items$ = this.data.listRx(this.patientId);
 
     // Prefill signer email
     const email = this.auth.currentUser?.email ?? '';
     this.form.patchValue({ signerEmail: email });

         
   }
 
   // Safe address builder for template (avoids arrow functions in bindings)
 address(p: any): string {
   const d = (p?.demographics as any) || {};
   const parts: string[] = [];
   if (d.address1) parts.push(d.address1);
   if (d.address2) parts.push(d.address2);
   const flat = (p as any)?.address;
   const out = parts.join(', ') || flat || '—';
   return out;
 }
 
   gotoWounds(p: Patient) {
     this.router.navigate(['/skin-wound', p.id, 'assessments']);
   }

   
  // Keep dates as Date|null (service converts for API/Firestore)
   form = this.fb.group({
     name: ['', Validators.required],
     dose: [''],
     route: [''],
     frequency: [''],
 
     medicationType: ['', Validators.required],
     medicationForm: ['', Validators.required],
     prescriber: ['', Validators.required],
 
     startDate: [null as Date | null, Validators.required],
     endDate:   [null as Date | null],
 
     notes: [''],
 
     // e-signature (re-auth)
     signerEmail: ['', [Validators.required, Validators.email]],
     signerPassword: ['', Validators.required],
     attest: [false, Validators.requiredTrue]
   });
 
   medicationTypes = ['Scheduled','PRN','Antibiotic','Anticoagulant','Analgesic','Antihypertensive','Insulin','Other'];
   medicationForms = ['Tablet','Capsule','Liquid','Injection','Topical','Patch','Inhaler','Suppository','Other'];
 
   async addRx() {
     if (this.form.invalid) return;
     this.loading = true;
 
     try {
       const v = this.form.getRawValue();
 
       // e-sign: re-auth the current user
       const current = this.auth.currentUser;
       if (!current) throw new Error('Not authenticated.');
       if (current.email !== v.signerEmail) {
         throw new Error('Email does not match the signed-in user.');
       }
       const cred = EmailAuthProvider.credential(v.signerEmail!, v.signerPassword!);
       await reauthenticateWithCredential(current, cred);
 
       // Send raw Date values; service converts/stamps
       const payload: Partial<Rx> & any = {
         name: v.name?.trim(),
         dose: v.dose?.trim() || null,
         route: v.route?.trim() || null,
         frequency: v.frequency?.trim() || null,
         medicationType: v.medicationType,
         medicationForm: v.medicationForm,
         prescriber: v.prescriber?.trim(),
         startDate: v.startDate || null,   // Date|null
         endDate:   v.endDate || null,     // Date|null
         notes: v.notes?.trim() || null,
         eSignature: {
           signerUid: current.uid,
           signerEmail: current.email,
           method: 'password' // signedAt added in service/backend
         }
       };
 
       await this.data.addRx(this.patientId, payload);
       this.snack.open('Prescription ajoutée et signée', 'OK', { duration: 2000 });
 
       this.form.reset({
         name: '', dose: '', route: '', frequency: '',
         medicationType: '', medicationForm: '', prescriber: '',
         startDate: null, endDate: null, notes: '',
         signerEmail: current.email || '', signerPassword: '', attest: false
       });
     } catch (e: any) {
       this.snack.open(`Erreur: ${e?.message || 'échec ajout'}`, 'Fermer', { duration: 3500 });
     } finally {
       this.loading = false;
     }
   }
 
   // ---------- Safe render helpers ----------
   getStart(p: any) {
     return p?.startDate ?? p?.startdate ?? null;
   }
   getEnd(p: any) {
     return p?.endDate ?? p?.enddate ?? null;
   }
 
   isFsTimestamp(v: any): boolean {
     return !!v && (
       typeof v?.toDate === 'function' ||
       (typeof v?.seconds === 'number' && typeof v?.nanoseconds === 'number')
     );
   }
 
   /** Normalize to a real Date for the Angular date pipe */
   toJsDate(v: any): Date | null {
     if (v == null) return null;
 
     if (typeof v?.toDate === 'function') {
       try { return v.toDate(); } catch { /* ignore */ }
     }
     if (typeof v?.seconds === 'number' && typeof v?.nanoseconds === 'number') {
       return new Date(v.seconds * 1000 + Math.floor(v.nanoseconds / 1e6));
     }
     if (v instanceof Date) return isNaN(+v) ? null : v;
 
     if (typeof v === 'number' || typeof v === 'string') {
       const d = new Date(v);
       return isNaN(+d) ? null : d;
     }
     return null;
   }
   
 }
 