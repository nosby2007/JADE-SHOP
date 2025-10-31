// src/app/nurse/pages/vitals-trend-dialog/vitals-trend-dialog.component.ts
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AssessmentsService } from '../../service/assessments.service';
import { AssessmentType } from '../../models/assessment.model';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import type { EChartsOption } from 'echarts';

type AnyRec = Record<string, any>;

@Component({
  selector: 'app-vitals-trend-dialog',
  templateUrl: './vitals-trend-dialog.component.html',
  styleUrls: ['./vitals-trend-dialog.component.scss']
})
export class VitalsTrendDialogComponent implements OnInit, OnDestroy {
  title = 'Vital Signs Trend';
  chartOptions$!: Observable<EChartsOption>;
  private sub?: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string; title?: string },
    private ref: MatDialogRef<VitalsTrendDialogComponent>,
    private svc: AssessmentsService
  ) {
    if (data?.title) this.title = data.title;
  }

  ngOnInit(): void {
    const pid = this.data?.patientId;
    // Pull vitalSigns assessments and convert to chart options
    this.chartOptions$ = this.svc.list(pid, 'vitalSigns' as AssessmentType).pipe(
      map(list => (list ?? []) as AnyRec[]),
      map(items =>
        items
          .slice()
          .sort((a, b) => this.toTime(a['measuredAt'] ?? a['createdAt']) - this.toTime(b['measuredAt'] ?? b['createdAt']))
      ),
      map(items => this.buildOptions(items))
    );
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  close(): void { this.ref.close(); }

  // --- helpers ---
  private toTime(v: any): number {
    if (!v) return 0;
    try {
      if (typeof v?.toDate === 'function') return +v.toDate();
      if (v?.seconds) return v.seconds * 1000;
      const d = new Date(v);
      return isNaN(+d) ? 0 : +d;
    } catch { return 0; }
  }

  private buildOptions(vitals: AnyRec[]): EChartsOption {
    const points = (key: string) =>
      vitals
        .filter(v => v[key] !== undefined && v[key] !== null)
        .map(v => [ this.toTime(v['measuredAt'] ?? v['createdAt']), Number(v[key]) ]);

    const systolic = points('systolic');
    const diastolic = points('diastolic');
    const hr = points('heartRate');
    const rr = points('respiratoryRate');
    const temp = points('temperatureC');
    const spo2 = points('spo2');
    const pain = points('painScore');

    const hasSpo2 = spo2.length > 0;

    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Systolic', 'Diastolic', 'HR', 'RR', 'Temp °C', 'SpO₂', 'Pain'] },
      grid: { left: 56, right: hasSpo2 ? 56 : 24, top: 40, bottom: 40 },
      xAxis: { type: 'time' },
      yAxis: [
        { type: 'value', name: 'Value' },
        ...(hasSpo2 ? [{ type: 'value', name: '% (SpO₂)', min: 80, max: 100 }] as any : [])
      ],
      series: [
        { name: 'Systolic', type: 'line', smooth: true, showSymbol: false, data: systolic },
        { name: 'Diastolic', type: 'line', smooth: true, showSymbol: false, data: diastolic },
        { name: 'HR', type: 'line', smooth: true, showSymbol: false, data: hr },
        { name: 'RR', type: 'line', smooth: true, showSymbol: false, data: rr },
        { name: 'Temp °C', type: 'line', smooth: true, showSymbol: false, data: temp },
        { name: 'SpO₂', type: 'line', smooth: true, showSymbol: false, yAxisIndex: hasSpo2 ? 1 : 0, data: spo2 },
        { name: 'Pain', type: 'line', smooth: true, showSymbol: false, data: pain }
      ]
    };
  }
}
