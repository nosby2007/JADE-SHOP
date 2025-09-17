import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase; // ex: https://us-central1-<PROJECT>.cloudfunctions.net/api/api/v1

  // Patients
  listPatients(search?:string){ const qs = search ? `?search=${encodeURIComponent(search)}` : ''; return this.http.get(`${this.base}/patients${qs}`); }
  getPatient(id:string){ return this.http.get(`${this.base}/patients/${id}`); }
  createPatient(b:any){ return this.http.post(`${this.base}/patients`, b); }
  
  listAllWounds(params?: { status?: string; acquired?: string; from?: string; to?: string; limit?: number }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.http.get(`${this.base}/wounds${qs}`);
  }
  
  // Wounds
  createWound(b:any){ return this.http.post(`${this.base}/wounds`, b); }
  listWoundsByPatient(patientId:string){ return this.http.get(`${this.base}/wounds/by-patient/${patientId}`); }
  resolveWound(id:string){ return this.http.post(`${this.base}/wounds/${id}/resolve`, {}); }

  // Assessments
  createAssessment(woundId:string, b:any){ return this.http.post(`${this.base}/assessments/wound/${woundId}`, b); }
  listAssessments(woundId:string, limit=20){ return this.http.get(`${this.base}/assessments/wound/${woundId}?limit=${limit}`); }

  // Care plans
  createCarePlan(woundId:string, b:any){ return this.http.post(`${this.base}/care-plans/wound/${woundId}`, b); }
  listCarePlans(woundId:string){ return this.http.get(`${this.base}/care-plans/wound/${woundId}`); }
  updateCarePlan(planId:string, b:any){ return this.http.patch(`${this.base}/care-plans/${planId}`, b); }
  completeCarePlan(planId:string){ return this.http.post(`${this.base}/care-plans/${planId}/complete`, {}); }

  // Tasks & Notes
  createTask(b:any){ return this.http.post(`${this.base}/tasks`, b); }
  listTasks(params?:{assignedToUid?:string; status?:'open'|'in-progress'|'done'}) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''; return this.http.get(`${this.base}/tasks${qs}`);
  }
  createNote(b:any){ return this.http.post(`${this.base}/notes`, b); }
  listNotes(filter?:{patientId?:string; woundId?:string}) {
    const qs = filter ? '?' + new URLSearchParams(filter as any).toString() : ''; return this.http.get(`${this.base}/notes${qs}`);
  }

  // Media (upload signé)
  requestUploadUrl(contentType:string, filename:string, refs?:any){ return this.http.post(`${this.base}/media/uploadUrl`, { contentType, filename, refs }); }
  saveMediaMeta(meta:any){ return this.http.post(`${this.base}/media`, meta); }

  // Rapport PDF
  generateWoundReport(woundId:string){ return this.http.post(`${this.base}/reports/wound/${woundId}`, {}); }
}

