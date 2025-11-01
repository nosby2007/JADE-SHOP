// src/app/core/patient-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Patient } from '../nurse/models/patient.model';


@Injectable({ providedIn: 'root' })
export class PatientApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/patients`;

  // --------- helpers payload ---------
  private toIsoOrUndefined(d: unknown): string | undefined {
    if (!d) return undefined;
    // Firestore Timestamp compat
    if (typeof (d as any)?.toDate === 'function') {
      const date = (d as any).toDate();
      return isNaN(date?.getTime?.()) ? undefined : date.toISOString();
    }
    // {seconds, nanoseconds}
    if (typeof (d as any)?.seconds === 'number') {
      const date = new Date((d as any).seconds * 1000);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    // Date
    if (d instanceof Date) {
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    }
    // string parsable
    if (typeof d === 'string') {
      const date = new Date(d);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return undefined;
  }

  private stripNullish<T extends Record<string, any>>(obj: T): Partial<T> {
    const out: any = {};
    Object.keys(obj || {}).forEach(k => {
      const v = (obj as any)[k];
      if (v !== null && v !== undefined) out[k] = v;
    });
    return out;
  }

  // Normalise le payload envoyé à l’API (dob → ISO, enlève null/undefined)
  private buildPayload(p: Partial<Patient>): Partial<Patient> {
    const dobIso = this.toIsoOrUndefined(p.dob);
    const payload = {
      ...p,
      dob: dobIso, // peut être undefined si invalide
    };
    return this.stripNullish(payload);
  }

  // --------- endpoints ---------
  list() {
    return this.http.get<Patient[]>(this.base);
  }

  get(id: string) {
    return this.http.get<Patient>(`${this.base}/${id}`);
  }

  create(data: Partial<Patient>) {
    const payload = this.buildPayload(data);
    // createdAt est ajouté côté backend (voir ta function POST /patients)
    return this.http.post<{ id: string }>(this.base, payload);
  }

  update(id: string, patch: Partial<Patient>) {
    const payload = this.buildPayload(patch);
    // on ajoute un updatedAt ISO pour homogénéiser (ton backend l’acceptera tel quel)
    const withUpdated = { ...payload, updatedAt: new Date().toISOString() };
    return this.http.patch<{ ok: true }>(`${this.base}/${id}`, withUpdated);
  }

  remove(id: string) {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }
}
