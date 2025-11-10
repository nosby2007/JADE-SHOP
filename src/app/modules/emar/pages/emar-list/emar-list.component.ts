import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-emar-list',
  templateUrl: './emar-list.component.html',
  styleUrls: ['./emar-list.component.scss']
})
export class EmarListComponent implements OnInit {
  patientId!: string;                          // set from route
  meds$!: Observable<any[]>;
  displayed = ['name','dose','route','freq','actions'];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    // this.patientId = this.route.snapshot.paramMap.get('id')!;
    // this.meds$ = this.medsSvc.listMeds(this.patientId);
  }

  openCreateMed() {
    this.dialog.open(EmarCreateDialogComponent, {
      width: '560px',
      data: { patientId: this.patientId }
    });
  }

  openAdminDialog(med: any) {
    this.dialog.open(EmarAdminDialogComponent, {
      width: '560px',
      data: { patientId: this.patientId, medId: med?.id }
    });
  }
}

// forward refs
import { EmarCreateDialogComponent } from '../emar-create-dialog/emar-create-dialog.component';
import { EmarAdminDialogComponent } from '../emar-admin-dialog/emar-admin-dialog.component';
