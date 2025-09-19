import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Patient {
  id?: string;
  name: string;
  gender?: 'male' | 'female' | 'other' | string;
  dob?: any;              // string | Date | Firestore Timestamp
  phone?: string;
  email?: string;
  address?: string;
  quartier?: string;
  departement?: string;
  docteur?: string;
  raison?: string;
  paiement?: string;
  createdAt?: any;        // Firestore Timestamp
  payor?: string;
  uin?: string;
  ssn?: string

}

@Injectable({ providedIn: 'root' })
export class PatientApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/patients`;
  list()   { return this.http.get<Patient[]>(this.base); }                    // GET /api/patients
  get(id: string) { return this.http.get<Patient>(`${this.base}/${id}`); }   // GET /api/patients/:id
  create(data: Partial<Patient>) { return this.http.post<{id:string}>(this.base, data); } // POST /api/patients
  update(id: string, patch: Partial<Patient>) { return this.http.patch<{ok:true}>(`${this.base}/${id}`, patch); }
  remove(id: string) { return this.http.delete<{ok:true}>(`${this.base}/${id}`); }
}
