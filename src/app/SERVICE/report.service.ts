import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) {}

  downloadPdf() {
    return this.http.get('/api/generate-pdf', { responseType: 'blob' });
  }
}