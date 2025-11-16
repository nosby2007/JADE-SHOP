import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// Support both RxJS 6 and 7:
import { lastValueFrom } from 'rxjs';

// AngularFire Auth (v7+ modular). For compat, see commented import.
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth } from '@angular/fire/auth';

// Optional: AngularFire Storage v7+ modular for getDownloadURL
import { getStorage, ref, getDownloadURL } from '@angular/fire/storage';

type PrintType = 'assessment' | 'prescription' | 'custom';

export interface PrintResponse {
  url?: string;      // signed URL, if your CF returns it
  name?: string;     // filename
  path?: string;     // storage path like "prints/uid/file.pdf"
  bucket?: string;
  base64?: string;   // PDF as base64 (if you requested it)
  contentType?: string; // optional (defaults to application/pdf)
}

@Injectable({ providedIn: 'root' })
export class CloudPrintService {
  /**
   * Set to your deployed CF endpoint, OR '/api' when using Firebase Hosting rewrites.
   * Keep the direct URL here since that’s what you’re currently using.
   */
  private readonly baseUrl = 'https://us-central1-woundapp-261e6.cloudfunctions.net/api';

  constructor(
    private http: HttpClient,
    private auth: Auth,
    // private afAuth: AngularFireAuth, // compat alternative
  ) {}

  // ---------- Utilities ----------

  /** Work with both RxJS 6 (.toPromise) and 7 (lastValueFrom) */
  private async toPromise<T>(obs: Observable<T>): Promise<T> {
    const anyObs: any = obs as any;
    if (typeof anyObs.toPromise === 'function') {
      return anyObs.toPromise();
    }
    return lastValueFrom(obs);
  }

  /** Ensure we have an authenticated user and return an ID token */
  private async getIdToken(): Promise<string> {
    // v7 modular auth
    const existing = this.auth.currentUser;
    if (existing) return existing.getIdToken();

    const user = await new Promise<any>(resolve => {
      const unsub = this.auth.onAuthStateChanged(u => { unsub(); resolve(u); });
    });
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  }

  /** Resolve a Storage path like "prints/uid/file.pdf" to a download URL */
  async getDownloadUrl(path: string): Promise<string> {
    const storage = getStorage();              // uses your default Firebase app
    const r = ref(storage, String(path));
    return getDownloadURL(r);
  }

  /** Open any returned print response (url | path | base64) in a new tab */
  async openPrintResponse(resp: PrintResponse) {
    // 1) Direct signed URL from your function
    if (resp && resp.url) {
      this.openPdfInNewTab(resp.url);
      return;
    }

    // 2) Storage path (requires Storage read permission OR publicly-signed URL from getDownloadURL)
    if (resp && resp.path) {
      const url = await this.getDownloadUrl(resp.path);
      this.openPdfInNewTab(url);
      return;
    }

    // 3) Base64 payload (if you asked for returnBase64)
    if (resp && resp.base64) {
      const contentType = resp.contentType || 'application/pdf';
      const byteChars = atob(resp.base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: contentType });
      const url = URL.createObjectURL(blob);
      this.openPdfInNewTab(url);
      // (Optional) URL.revokeObjectURL later if you store the handle somewhere.
      return;
    }

    throw new Error('No URL, path, or base64 found in PrintResponse');
  }

  /** Simple, popup-safe opener */
  openPdfInNewTab(url: string) {
    try {
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      if (!w) {
        alert('Please allow pop-ups to view/print the PDF.');
      }
    } catch {
      alert('Popup blocked. Copy this URL:\n' + url);
    }
  }

  // ---------- Core print call ----------

  /**
   * Calls POST /print on your CF API.
   * Accepts options for bucketName, returnBase64, urlExpiryHours.
   */
  async print(
    type: PrintType,
    data: any,
    opts?: { bucketName?: string; returnBase64?: boolean; urlExpiryHours?: number }
  ): Promise<PrintResponse> {
    const idToken = await this.getIdToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    });

    const body: any = {
      type,
      data
    };
    if (opts && opts.bucketName) body.bucketName = opts.bucketName;
    if (opts && typeof opts.returnBase64 === 'boolean') body.returnBase64 = opts.returnBase64;
    if (opts && opts.urlExpiryHours) body.urlExpiryHours = opts.urlExpiryHours;

    const obs = this.http.post<PrintResponse>(`${this.baseUrl}/print`, body, { headers });
    const resp = await this.toPromise(obs);

    if (!resp) throw new Error('Print failed: empty response');
    if (!resp.url && !resp.path && !resp.base64) {
      throw new Error('Print failed: no URL/path/base64 returned');
    }
    return resp;
  }

  // ---------- Convenience wrappers ----------

  async printAssessment(assessment: any, openAfter = true) {
    const resp = await this.print('assessment', this.mapAssessment(assessment));
    if (openAfter) await this.openPrintResponse(resp);
    return resp;
  }

  async printPrescription(prescription: any, openAfter = true) {
    const resp = await this.print('prescription', this.mapPrescription(prescription));
    if (openAfter) await this.openPrintResponse(resp);
    return resp;
  }

  async printCustom(payload: { title?: string; subtitle?: string; html?: string; signatures?: any }, openAfter = true) {
    const resp = await this.print('custom', payload);
    if (openAfter) await this.openPrintResponse(resp);
    return resp;
  }

  // ---------- Mapping helpers (adapt to your schema) ----------

  private mapAssessment(a: any) {
    return {
      patient: {
        name:  a && a.patient && a.patient.name  ? a.patient.name  : (a && a.patientName) || '—',
        dob:   a && a.patient && a.patient.dob   ? a.patient.dob   : (a && a.patientDob)  || '—',
        id:    a && a.patient && a.patient.id    ? a.patient.id    : (a && a.patientId)   || '—',
      },
      date:      (a && a.assessedAt) || (a && a.date) || new Date().toLocaleString(),
      assessor:  (a && a.assessor) || (a && a.createdByName) || '',
      location:  (a && a.location) || '',
      vitals: {
        bp:     a && a.vitals && a.vitals.bp     ? a.vitals.bp     : (a && a.bp)        || '',
        hr:     a && a.vitals && a.vitals.hr     ? a.vitals.hr     : (a && a.hr)        || '',
        temp:   a && a.vitals && a.vitals.temp   ? a.vitals.temp   : (a && a.temperature)|| '',
        rr:     a && a.vitals && a.vitals.rr     ? a.vitals.rr     : (a && a.resp)      || '',
        spo2:   a && a.vitals && a.vitals.spo2   ? a.vitals.spo2   : (a && a.spo2)      || '',
        weight: a && a.vitals && a.vitals.weight ? a.vitals.weight : (a && a.weight)    || '',
      },
      findings:  (a && Array.isArray(a.findings)) ? a.findings : [],
      signatures: a && a.signatures ? a.signatures : null,
      id: a && a.id ? a.id : undefined
    };
  }

  private mapPrescription(rx: any) {
    return {
      patient: {
        name: (rx && rx.patient && rx.patient.name) ? rx.patient.name : (rx && rx.patientName) || '—',
        dob:  (rx && rx.patient && rx.patient.dob)  ? rx.patient.dob  : (rx && rx.patientDob)  || '—',
        id:   (rx && rx.patient && rx.patient.id)   ? rx.patient.id   : (rx && rx.patientId)   || '—',
      },
      date: (rx && rx.date) || new Date().toLocaleString(),
      prescriber: (rx && rx.prescriber) || (rx && rx.providerName) || '',
      license:    (rx && rx.license)    || (rx && rx.providerLicense) || '',
      items: (rx && Array.isArray(rx.items)) ? rx.items : [],
      signatures: rx && rx.signatures ? rx.signatures : null,
      id: rx && rx.id ? rx.id : undefined
    };
  }
}
