import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, map } from 'rxjs';
import { NurseDataService } from '../../service/nurse-data.service';
import { AddPrescriptionDialogResult } from '../add-prescription-dialog/add-prescription-dialog.component';
import firebase from 'firebase/compat/app';


export interface ViewOrderDialogData {
  patientId: string;
  patientName?: string;   // optional fast-path (if caller already has it)
  note: AddPrescriptionDialogResult & { id?: string };
  startDate: firebase.firestore.Timestamp;
  endDate: firebase.firestore.Timestamp;
  description: string;
  instructions: string;
  medicationName: string;
  dosage: string;
  routeOrder: string;
  frequencyOrder: string;
  details: string;

}
@Component({
  selector: 'app-view-order-dialog',
  templateUrl: './view-order-dialog.component.html',
  styleUrls: ['./view-order-dialog.component.scss']
})
export class ViewOrderDialogComponent  {

 patientName$: Observable<string>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ViewOrderDialogData,
    private dlgRef: MatDialogRef<ViewOrderDialogComponent>,
    nurse: NurseDataService
  ) {
    this.patientName$ = data.patientName
      ? of(data.patientName)
      : nurse.getPatient(data.patientId).pipe(map(p => p?.name ?? '—'));
  }


  close() { this.dlgRef.close(); }

  asDate(v: any): Date | null {
    if (!v) return null;
    if (v?.toDate) return (v as firebase.firestore.Timestamp).toDate();
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }

  // Optional: quick print
  print() { window.print(); }

}
