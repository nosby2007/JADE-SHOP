import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AssessmentsService } from '../../service/assessments.service';
import { Assessment, AssessmentType } from '../../models/assessment.model';
import { AddAssessmentDialogComponent } from '../add-assessment-dialog/add-assessment-dialog.component';
import { VitalsTrendDialogComponent } from '../vitals-trend-dialog/vitals-trend-dialog.component';
import type { EChartsOption } from 'echarts';

type TabKey = AssessmentType | 'vitalSigns' | 'antibiotic';

declare const pdfMake: any;

const docDef = { content: ['Hello PDF'] };
pdfMake.createPdf(docDef).open();   // vfs is already set by vfs_fonts.js

@Component({
  selector: 'app-nurse-assessment',
  templateUrl: './nurse-assessment.component.html',
  styleUrls: ['./nurse-assessment.component.scss']
})
export class NurseAssessmentsComponent implements OnInit {

  
  patientId = '';
  tabs: { key: TabKey; label: string }[] = [
    { key: 'skinWeekly', label: 'Skin (Weekly)' },
    { key: 'pressureInjuryWeekly', label: 'Pressure Injury (Weekly)' },
    { key: 'braden', label: 'Braden Scale' },
    { key: 'progressNote', label: 'Progress Notes' },
    { key: 'carePlan', label: 'Care Plan' },
    { key: 'vitalSigns', label: 'Vital Signs' },
    { key: 'antibiotic', label: 'Antibiotics' }
  ];

  streams: Partial<Record<TabKey, Observable<Assessment[]>>> = {};
  vitalsOptions$?: Observable<EChartsOption>;

  constructor(
    private ar: ActivatedRoute,
    private svc: AssessmentsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientId = this.ar.snapshot.paramMap.get('id') || '';

    if (!this.patientId) {
      this.streams = {} as any;
      return;
    }

    this.streams = {
      braden:               this.svc.list(this.patientId, 'braden'),
      skinWeekly:           this.svc.list(this.patientId, 'skinWeekly'),
      pressureInjuryWeekly: this.svc.list(this.patientId, 'pressureInjuryWeekly'),
      progressNote:         this.svc.list(this.patientId, 'progressNote'),
      carePlan:             this.svc.list(this.patientId, 'carePlan'),
      vitalSigns:           this.svc.list(this.patientId, 'vitalSigns' as AssessmentType),
      antibiotic:           this.svc.list(this.patientId, 'antibiotic' as unknown as AssessmentType),
    };

    this.vitalsOptions$ = this.streams.vitalSigns!.pipe(
      map(rows => {
        const toDate = (v: any): Date => {
          if (!v) return new Date(0);
          if (typeof v?.toDate === 'function') return v.toDate();
          if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000);
          return new Date(v);
        };
        const get = (a: any, k: string) => a?.[k] ?? a?.vitals?.[k];

        const sorted = [...(rows || [])].sort((a, b) =>
          +toDate((a as any).measuredAt ?? a.createdAt) -
          +toDate((b as any).measuredAt ?? b.createdAt)
        );

        const x: number[] = [];
        const sys: (number | null)[] = [];
        const dia: (number | null)[] = [];
        const hr:  (number | null)[] = [];
        const tc:  (number | null)[] = [];

        for (const r of sorted) {
          const t = +toDate((r as any).measuredAt ?? r.createdAt);
          x.push(t);
          sys.push(Number(get(r, 'systolic')) || null);
          dia.push(Number(get(r, 'diastolic')) || null);
          hr.push(Number(get(r, 'heartRate')) || null);
          const temp = get(r, 'temperatureC');
          tc.push(temp != null ? Number(temp) : null);
        }

        const toPairs = (xs: number[], ys: (number|null)[]) =>
          xs.map((t, i) => (ys[i] == null ? [t, null] : [t, ys[i] as number]));

        const opt: EChartsOption = {
          tooltip: { trigger: 'axis' },
          legend:  { data: ['Systolic', 'Diastolic', 'Heart Rate', 'Temp °C'] },
          grid:    { left: 36, right: 42, top: 24, bottom: 28 },
          xAxis:   { type: 'time' },
          yAxis: [
            { type: 'value', name: 'BP / HR' },
            { type: 'value', name: 'Temp °C', position: 'right' }
          ],
          series: [
            { name: 'Systolic', type: 'line', showSymbol: false, data: toPairs(x, sys), yAxisIndex: 0, smooth: true },
            { name: 'Diastolic', type: 'line', showSymbol: false, data: toPairs(x, dia), yAxisIndex: 0, smooth: true },
            { name: 'Heart Rate', type: 'line', showSymbol: false, data: toPairs(x, hr),  yAxisIndex: 0, smooth: true },
            { name: 'Temp °C', type: 'line', showSymbol: false, data: toPairs(x, tc),  yAxisIndex: 1, smooth: true }
          ]
        };
        return opt;
      })
    );
  }

  openAdd(type: AssessmentType | 'vitalSigns' | 'antibiotic') {
    this.dialog.open(AddAssessmentDialogComponent, {
      width: '780px',
      maxWidth: '96vw',
      data: { patientId: this.patientId, type: (type as AssessmentType) }
    });
  }

  async compileAdmission() {
    const url = await this.svc.compileAdmission(this.patientId);
    window.open(url, '_blank');
  }
  async compileDischarge() {
    const url = await this.svc.compileDischarge(this.patientId);
    window.open(url, '_blank');
  }

  // ---- Helpers used by template ----
  toJsDate(v: any): Date | null {
    if (v == null) return null;
    if (typeof v?.toDate === 'function') { try { return v.toDate(); } catch {} }
    if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000);
    if (v instanceof Date) return isNaN(+v) ? null : v;
    const d = new Date(v); return isNaN(+d) ? null : d;
  }

  displayDate(row: any): Date | null {
    return this.toJsDate(row?.measuredAt ?? row?.createdAt);
  }

  vs(row: any, key: string): any {
    return row?.[key] ?? row?.vitals?.[key] ?? null;
  }

  openVitalsTrend(): void {
    if (!this.patientId) return;
    this.dialog.open(VitalsTrendDialogComponent, {
      data: { patientId: this.patientId, title: 'Vital Signs – Trend' },
      width: '900px',
      maxWidth: '95vw'
    });
  }
}
