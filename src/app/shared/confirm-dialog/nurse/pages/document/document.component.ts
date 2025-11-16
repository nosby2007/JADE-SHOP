import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { PatientDocumentService } from '../document.service';
import { DocumentDialogComponent } from '../document-dialog/document-dialog.component';

export interface PatientDocument {
  id?: string;
  fileId?: string;
  name: string;
  size?: number;
  mimeType?: string | null;
  type?: string | null;
  description?: string | null;
  url?: string | null;
  path?: string | null;
  patientId: string;
  visitId?: string | null;
  woundId?: string | null;
  taskId?: string | null;
  visibility?: 'careTeam' | 'adminOnly' | 'patientAndTeam' | null;
  uploadedBy?: { uid: string; role?: string | null; email?: string | null } | null;
  createdAt?: any;
}

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  @Input() patientId?: string;  // must be provided or present in route
  @Input() woundId?: string;    // (ignored for listing, kept for compatibility)
  @Input() visitId?: string;    // (ignored for listing, kept for compatibility)

  displayedColumns: string[] = ['name', 'type', 'description', 'createdAt', 'download'];
  dataSource = new MatTableDataSource<PatientDocument>([]);
  loading = true;
  errorMsg = '';

  private sub?: Subscription;
  private rawDocs: PatientDocument[] = [];
  selectedFilter: 'All' | 'Photos' | 'PDF' = 'All';

  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private docService: PatientDocumentService
  ) {}

  ngOnInit(): void {
    // Resolve patient id from @Input OR route params
    const fromInput = this.patientId;
    const fromRoute =
      this.route.snapshot.paramMap.get('patientId') ||
      this.route.snapshot.paramMap.get('id') ||
      undefined;

    const pid = fromInput ?? fromRoute;

    if (!pid) {
      this.loading = false;
      this.errorMsg = 'No patient selected. Open this page with a patient context.';
      console.error('[DocumentsComponent] patientId is required');
      return;
    }

    this.patientId = pid;
    this.dataSource.sort = this.sort;
    this.subscribeToPatient(pid);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private subscribeToPatient(pid: string) {
    this.loading = true;
    this.sub?.unsubscribe();

    this.sub = this.docService.getPatientDocuments(pid).subscribe({
      next: (docs: any[]) => {
        // Normalize nulls to keep the interface strict-ish
        const normalized: PatientDocument[] = (docs || []).map(d => ({
          ...d,
          type: d?.type ?? null,
          description: d?.description ?? null,
          url: d?.url ?? null,
          path: d?.path ?? null,
          visitId: d?.visitId ?? null,
          woundId: d?.woundId ?? null,
          taskId: d?.taskId ?? null,
          mimeType: d?.mimeType ?? null,
          uploadedBy: d?.uploadedBy ?? null,
        }));
        this.rawDocs = normalized;
        this.applyQuickFilter(this.selectedFilter);
        this.loading = false;
      },
      error: (err) => {
        console.error('[DocumentsComponent] failed to load docs:', err);
        this.dataSource.data = [];
        this.loading = false;
        this.errorMsg = 'Unable to load documents.';
      }
    });
  }

  applyQuickFilter(kind: 'All' | 'Photos' | 'PDF') {
    this.selectedFilter = kind;

    const isPhoto = (d: PatientDocument) =>
      (d.mimeType && d.mimeType.indexOf('image/') === 0) ||
      (d.type && d.type.toLowerCase().indexOf('photo') !== -1) ||
      (d.name && /\.(png|jpe?g|gif|webp|bmp)$/i.test(d.name));

    const isPdf = (d: PatientDocument) =>
      d.mimeType === 'application/pdf' || (d.name && /\.pdf$/i.test(d.name));

    this.dataSource.data =
      kind === 'All'
        ? this.rawDocs
        : kind === 'Photos'
          ? this.rawDocs.filter(isPhoto)
          : this.rawDocs.filter(isPdf);
  }

  openUploadDialog(): void {
    if (!this.patientId) return;
    this.dialog.open(DocumentDialogComponent, {
      width: '620px',
      data: {
        patientId: this.patientId
      }
    });
  }

  async deleteDocument(row: PatientDocument): Promise<void> {
    if (!row.id || !row.path || !this.patientId) return;
    const ok = confirm(`Do you want to delete "${row.name}"?`);
    if (!ok) return;
    try {
      await this.docService.deletePatientDocument(this.patientId, row.id, row.path);
    } catch (e) {
      console.error('Error while deleting:', e);
    }
  }
}
