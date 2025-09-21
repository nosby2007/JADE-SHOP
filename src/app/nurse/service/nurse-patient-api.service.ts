import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class NursePatientApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/patients`; // ex: https://us-central1-.../api/patients

  list(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.base);
  }
  get(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.base}/${id}`);
  }
  create(data: Partial<Patient>): Observable<{id: string}> {
    return this.http.post<{id: string}>(this.base, data);
  }
  update(id: string, patch: Partial<Patient>) {
    return this.http.patch<{ok:true}>(`${this.base}/${id}`, patch);
  }
  remove(id: string) {
    return this.http.delete<{ok:true}>(`${this.base}/${id}`);
  }
}
