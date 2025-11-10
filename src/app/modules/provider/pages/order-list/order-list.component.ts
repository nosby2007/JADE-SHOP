// src/app/nurse/pages/nurse-prescriptions/nurse-prescriptions.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';


// Firebase Auth for e-sign
import { Auth, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';
import { Rx } from 'src/app/nurse/models/patient.model';
import { LaboratoryRxResult, LaboratoryRxDialogComponent } from 'src/app/nurse/pages/nurse-prescriptions/prescription-dialog/laboratory-rx-dialog/laboratory-rx-dialog.component';
import { NutritionRxResult, NutritionRxDialogComponent } from 'src/app/nurse/pages/nurse-prescriptions/prescription-dialog/nutrition-rx-dialog/nutrition-rx-dialog.component';
import { OrderRxResult, OrderRxDialogComponent } from 'src/app/nurse/pages/nurse-prescriptions/prescription-dialog/order-rx-dialog/order-rx-dialog.component';
import { PharmacyRxResult, PharmacyRxDialogComponent } from 'src/app/nurse/pages/nurse-prescriptions/prescription-dialog/pharmacy-rx-dialog/pharmacy-rx-dialog.component';
import { NurseDataService } from 'src/app/nurse/service/nurse-data.service';
import { AddPrescriptionDialogResult } from 'src/app/nurse/pages/add-prescription-dialog/add-prescription-dialog.component';
import { ViewOrderDialogComponent } from 'src/app/nurse/pages/view-order-dialog/view-order-dialog.component';

// Dialogs (ensure these export the *Result types shown)


type RxKind = 'pharmacy' | 'laboratory' | 'nutrition' | 'order';
type AnyDialogResult = PharmacyRxResult | LaboratoryRxResult | NutritionRxResult | OrderRxResult;
type DialogData = { patientId: string; prefillEmail: string };

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  patientId!: string;
    items$!: Observable<Rx[]>;
    displayed = [
      'category','name','dose','route','frequency', 'notes',
      'prescriber','startDate','endDate', 'actions'
    ];
    patientName!: string;
  
    constructor(
      private ar: ActivatedRoute,
      private data: NurseDataService,
      private snack: MatSnackBar,
      private auth: Auth,
      private dialog: MatDialog
    ) {}
  
    ngOnInit(): void {
      this.patientId = this.ar.snapshot.paramMap.get('id')!;
      this.items$ = this.data.listRx(this.patientId);
    }
  
    // --------- Date helpers (robust to string / timestamp-like) ---------
    private asDate(v: any): Date | null {
      if (v == null) return null;
      if (v instanceof Date) return isNaN(+v) ? null : v;
  
      if (typeof v?.toDate === 'function') {
        try {
          const d = v.toDate();
          return isNaN(+d) ? null : d;
        } catch { return null; }
      }
      if (typeof v?.seconds === 'number') {
        const ms = v.seconds * 1000 + Math.floor((v.nanoseconds ?? 0) / 1e6);
        const d = new Date(ms);
        return isNaN(+d) ? null : d;
      }
      if (typeof v === 'string' || typeof v === 'number') {
        const d = new Date(v);
        return isNaN(+d) ? null : d;
      }
      return null;
    }
  
    /** Merge a calendar date (Date|string|TS) with an HH:mm string if provided */
    private mergeDateAndTime(dateish: any, timeHHmm?: string | null): Date | null {
      const d = this.asDate(dateish);
      if (!d) return null;
      if (!timeHHmm) return d;
  
      // time as "HH:mm"
      const m = /^(\d{2}):(\d{2})$/.exec(String(timeHHmm).trim());
      if (!m) return d;
      const hours = +m[1], minutes = +m[2];
      const out = new Date(d);
      out.setHours(hours, minutes, 0, 0);
      return out;
    }
  
    // --------- Open add dialog by kind ---------
    openAdd(kind: RxKind) {
      const email = this.auth.currentUser?.email ?? '';
      const data: DialogData = { patientId: this.patientId, prefillEmail: email };
  
      if (kind === 'pharmacy') {
        const ref = this.dialog.open<PharmacyRxDialogComponent, DialogData, PharmacyRxResult>(
          PharmacyRxDialogComponent, { width: '780px', maxWidth: '96vw', data }
        );
        ref.afterClosed().subscribe(res => res && this.saveFromDialog(kind, res));
        return;
      }
      if (kind === 'laboratory') {
        const ref = this.dialog.open<LaboratoryRxDialogComponent, DialogData, LaboratoryRxResult>(
          LaboratoryRxDialogComponent, { width: '780px', maxWidth: '96vw', data }
        );
        ref.afterClosed().subscribe(res => res && this.saveFromDialog(kind, res));
        return;
      }
      if (kind === 'nutrition') {
        const ref = this.dialog.open<NutritionRxDialogComponent, DialogData, NutritionRxResult>(
          NutritionRxDialogComponent, { width: '780px', maxWidth: '96vw', data }
        );
        ref.afterClosed().subscribe(res => res && this.saveFromDialog(kind, res));
        return;
      }
      // order
      const ref = this.dialog.open<OrderRxDialogComponent, DialogData, OrderRxResult>(
        OrderRxDialogComponent, { width: '780px', maxWidth: '96vw', data }
      );
      ref.afterClosed().subscribe(res => res && this.saveFromDialog(kind, res));
    }
  
    // --------- Save from any dialog (with re-auth) ---------
    private async saveFromDialog(kind: RxKind, v: AnyDialogResult) {
      try {
        // e-sign: re-auth current user
        const current = this.auth.currentUser;
        if (!current) throw new Error('Not authenticated.');
        if (current.email !== v.signerEmail) {
          throw new Error('Email does not match the signed-in user.');
        }
        const cred = EmailAuthProvider.credential(v.signerEmail!, v.signerPassword!);
        await reauthenticateWithCredential(current, cred);
  
        // Common date fields from dialogs:
        // - some dialogs provide 'date' + 'time'
        // - some provide 'startDate'/'endDate' (as Date|string)
        const startDate = this.mergeDateAndTime(
          (v as any).startDate ?? (v as any).date ?? null,
          (v as any).time ?? null
        );
        const endDate = this.mergeDateAndTime((v as any).endDate ?? null, null);
  
        // Normalize payload to your Rx shape; keep a rich "details" blob
        const base: any = {
          category:
            kind === 'pharmacy'   ? 'Pharmacy'   :
            kind === 'laboratory' ? 'Laboratory' :
            kind === 'nutrition'  ? 'Nutrition'  : 'Order',
          prescriber: v.prescriber?.trim() || null,
          startDate,
          endDate,
          notes: (v as any).notes?.trim?.() || null,
          eSignature: {
            signerUid: current.uid,
            signerEmail: current.email,
            method: 'password'
          },
          details: { ...v } // full raw form for audit/printing
        };
  
        // Category-specific mapping
        if (kind === 'pharmacy') {
          const p = v as PharmacyRxResult;
          base.name = p.medication?.trim() || 'Medication';
          base.dose = p.dose?.trim() || null;
          base.route = p.route || null;
          base.frequency = p.frequency || null;
        } else if (kind === 'laboratory') {
          const l = v as LaboratoryRxResult;
          base.name = l.testType || 'Lab order';
          base.dose = null;
          base.route = l.specimen || null;
          base.frequency =
            l.scheduleType === 'daily'
              ? 'Once'
              : l.scheduleType === 'every-x-days'
                ? (l.everyXDays ? `Every ${l.everyXDays} days` : 'Every X days')
                : 'Specific days';
          base.summary = l.description || null;
        } else if (kind === 'nutrition') {
          const n = v as NutritionRxResult;
          base.name = n.description?.slice(0, 64) || 'Nutrition order';
          base.dose = null;
          base.route = n.route || null;
          base.frequency = n.frequency || null;
        } else { // order
          const o = v as OrderRxResult;
          base.name = o.description?.slice(0, 64) || 'Order';
          base.dose = null;
          base.route = o.route || null;
          base.frequency = o.frequency || null;
        }
  
        await this.data.addRx(this.patientId, base);
        this.snack.open('Prescription added and signed', 'OK', { duration: 2000 });
      } catch (e: any) {
        this.snack.open(`Error: ${e?.message || 'failed to add prescription'}`, 'Close', { duration: 3500 });
        console.error(e);
      }
    }
  
    // ---------- Safe render helpers (unchanged) ----------
    getStart(p: any) { return p?.startDate ?? p?.startdate ?? null; }
    getEnd(p: any) { return p?.endDate ?? p?.enddate ?? null; }
  
    toJsDate(v: any): Date | null {
      if (v == null) return null;
      if (typeof v?.toDate === 'function') { try { return v.toDate(); } catch {} }
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
     openView(note: AddPrescriptionDialogResult & { id?: string }) {
        this.dialog.open(ViewOrderDialogComponent, {
          width: '980px',
          autoFocus: false,
          data: {
            patientId: this.patientId,
            patientName: this.patientName,
            note
          }
        });
      }
       edit(r: any) {
    // TODO: open edit dialog
    // this.openOrderDialog(r);
  }

  remove(r: any) {
    // TODO: call service to delete
    // if (confirm('Delete this order?')) { ... }
  }

}
