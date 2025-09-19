// src/app/core/services/wound-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { WoundAssessment } from 'src/app/models/wound-assessment.model';

@Injectable({ providedIn: 'root' })
export class WoundApiService {
  private http = inject(HttpClient);

  // IMPORTANT : pas de slash final dans environment.apiBase
  // Exemple: https://us-central1-<project>.cloudfunctions.net/api
  private base = `${environment.apiBase}/wounds`;

  list(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${patientId}`);
  }

  get(patientId: string, assessmentId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${patientId}/${assessmentId}`);
  }

  create(patientId: string, data: WoundAssessment) {
    return this.http.post<{ id: string }>(this.base, { patientId, data });
  }

  update(patientId: string, assessmentId: string, patch: Partial<WoundAssessment>) {
    return this.http.patch<{ ok: true }>(`${this.base}/${patientId}/${assessmentId}`, patch);
  }

  remove(patientId: string, assessmentId: string) {
    return this.http.delete<{ ok: true }>(`${this.base}/${patientId}/${assessmentId}`);
  }
}
