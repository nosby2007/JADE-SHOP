import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import firebase from 'firebase/compat/app';
import { ProviderNote } from 'src/app/models/global.model';
import { ProviderNoteService } from '../../Service/provider-note.service';
import { NoteCreateDialogComponent } from '../note-create-dialog/note-create-dialog.component';
import { ViewNoteDialogComponent } from '../view-note-dialog/view-note-dialog.component';


@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent implements OnInit {
  patientId!: string;
  items$!: Observable<ProviderNote[]>;
   patientName?: string; 

  displayed = ['effectiveAt','type','visitType','providerName','actions'];

  constructor(
    private route: ActivatedRoute,
    private svc: ProviderNoteService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.items$ = this.svc.list(this.patientId);
  }

  toDate(x: any): Date | null {
    if (!x) return null;
    return x.toDate ? x.toDate() : new Date(x);
  }

  openCreate() {
    this.dialog.open(NoteCreateDialogComponent, {
      width: '900px',
      data: { patientId: this.patientId }
    }).afterClosed().subscribe();
  }

  async remove(n: ProviderNote) {
    if (!n.id) return;
    if (!confirm('Delete this note?')) return;
    await this.svc.remove(this.patientId, n.id);
  }

   openView(note: ProviderNote & { id?: string }) {
    this.dialog.open(ViewNoteDialogComponent, {
      width: '980px',
      autoFocus: false,
      data: {
        patientId: this.patientId,
        patientName: this.patientName,
        note
      }
    });
  }
}
