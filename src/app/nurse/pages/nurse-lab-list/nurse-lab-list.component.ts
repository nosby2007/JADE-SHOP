import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { map, startWith, takeUntil, catchError } from 'rxjs/operators';

import { LabReport } from 'src/app/models/global.model';
import { LabOrderDialogComponent } from 'src/app/modules/provider/pages/lab-order-dialog/lab-order-dialog.component';
import { ViewLabsDialogComponent } from 'src/app/modules/provider/pages/view-labs-dialog/view-labs-dialog.component';
import { LabService } from 'src/app/modules/provider/Service/labs.service';

@Component({
  selector: 'app-nurse-lab-list',
  templateUrl: './nurse-lab-list.component.html',
  styleUrls: ['./nurse-lab-list.component.scss']
})
export class NurseLabListComponent implements OnInit {

 /** Optional: parent can pass these directly */
   @Input() patientIdInput?: string;
   @Input() patientName?: string;
 
   patientId = '';
   items$!: Observable<LabReport[]>;
   displayedColumns: string[] = [
      'reportName', 'orderingProvider', 'flag', 'status', 'actions'
   ];
 
   private destroy$ = new Subject<void>();
 
   constructor(
     private route: ActivatedRoute,
     private svc: LabService,
     private dialog: MatDialog
   ) {}
 
   ngOnInit(): void {
     const routeId$ = this.route.paramMap.pipe(
       map(pm => pm.get('patientId') || pm.get('id') || ''),
       startWith('')
     );
 
     const parentId$ = this.route.parent
       ? this.route.parent.paramMap.pipe(
           map(pm => pm.get('patientId') || pm.get('id') || ''),
           startWith('')
         )
       : of('');
 
     combineLatest([routeId$, parentId$])
       .pipe(takeUntil(this.destroy$))
       .subscribe(([rid, pid]) => {
         this.patientId = this.patientIdInput || rid || pid || '';
         if (!this.patientId) {
           console.error('Patient ID is missing!');
           return;
         }
         this.items$ = this.svc.list(this.patientId).pipe(
           catchError(err => {
             console.error('Failed to load labs:', err);
             return of([]);
           })
         );
       });
   }
 
   ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
   }
 
   toDate(x: any): Date | null {
     if (!x) return null;
     return x?.toDate ? x.toDate() : new Date(x);
   }
 
   openNewLab(): void {
     if (!this.patientId) {
       console.error('Patient ID is missing!');
       return;
     }
     this.dialog.open(LabOrderDialogComponent, {
       width: '1080px',
       autoFocus: false,
       data: { patientId: this.patientId }
     }).afterClosed().subscribe(ok => ok && (this.items$ = this.svc.list(this.patientId)));
   }
 
   edit(r: LabReport): void {
     if (!this.patientId) return;
     this.dialog.open(LabOrderDialogComponent, {
       width: '1080px',
       autoFocus: false,
       data: { patientId: this.patientId, report: r }
     }).afterClosed().subscribe(ok => ok && (this.items$ = this.svc.list(this.patientId)));
   }
 
   async remove(r: LabReport): Promise<void> {
     if (!this.patientId || !r.id) return;
     if (!confirm('Delete this lab report?')) return;
     await this.svc.remove(this.patientId, r.id);
     this.items$ = this.svc.list(this.patientId);
   }
 
   openView(r: LabReport): void {
     if (!this.patientId) return;
     this.dialog.open(ViewLabsDialogComponent, {
       width: '980px',
       autoFocus: false,
       data: {
         patientId: this.patientId,
         patientName: this.patientName,
         report: r
       }
     });
   }
 
   // For *ngFor perf
   trackById = (_: number, row: LabReport) => row.id || '';
 }