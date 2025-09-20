// src/app/features/skin-wound/pages/media-gallery/media-gallery.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type MediaDoc = { id: string; url: string; kind?: string; createdAt?: any };

@Component({
  selector: 'app-media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss']
})
export class MediaGalleryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private afs = inject(AngularFirestore);

  patientId!: string;
  items$!: Observable<MediaDoc[]>;

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.items$ = this.afs.collection<MediaDoc>(
      `patients/${this.patientId}/media`,
      ref => ref.orderBy('createdAt', 'desc')
    ).snapshotChanges().pipe(
      map(snaps => snaps.map(s => ({ id: s.payload.doc.id, ...(s.payload.doc.data() as any) })))
    );
  }
}
