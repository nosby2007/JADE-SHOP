import { Component, OnInit, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map } from 'rxjs';
import type { ECharts, EChartsOption } from 'echarts';

import { AssessmentsService } from '../../service/assessments.service';
import { Assessment, AssessmentType } from '../../models/assessment.model';
import { AddAssessmentDialogComponent } from '../add-assessment-dialog/add-assessment-dialog.component';
import { VitalsTrendDialogComponent } from '../vitals-trend-dialog/vitals-trend-dialog.component';

type TabKey = AssessmentType | 'vitalSigns' | 'antibiotic' | 'nurseAdmission';

/** Type "souple" pour lire sans erreurs TS les champs facultatifs selon la variante */
type LooseAssessment = Assessment & {
  answers?: any;
  vitals?: any;
  measuredAt?: any;
  createdAt?: any;
  kind?: string;
  program?: string;
  pdfUrl?: string;
  score?: number;
  eSignature?: { signerName?: string; signerEmail?: string };
};

@Component({
  selector: 'app-nurse-assessment',
  templateUrl: './nurse-assessment.component.html',
  styleUrls: ['./nurse-assessment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NurseAssessmentsComponent implements OnInit {
  generating = false;
  patientId = '';

  tabs: { key: TabKey; label: string }[] = [
    { key: 'skinWeekly',            label: 'Skin (Weekly)' },
    { key: 'pressureInjuryWeekly',  label: 'Pressure Injury (Weekly)' },
    { key: 'braden',                label: 'Braden Scale' },
    { key: 'progressNote',          label: 'Progress Notes' },
    { key: 'carePlan',              label: 'Care Plan' },
    { key: 'vitalSigns',            label: 'Vital Signs' },
    { key: 'antibiotic',            label: 'Antibiotics' },
    { key: 'nurseAdmission',        label: 'Nurse Admission' }
  ];

  streams: Partial<Record<TabKey, Observable<Assessment[]>>> = {};
  vitalsOptions$?: Observable<EChartsOption>;

  /** Onglet actif pour éviter l’init d’ECharts dans un conteneur caché */
  activeTabKey: TabKey = 'skinWeekly';

  /** Référence du chart pour resize */
  private vitalsChart?: ECharts;

  constructor(
    private ar: ActivatedRoute,
    private svc: AssessmentsService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.patientId = this.ar.snapshot.paramMap.get('id') || '';
    if (!this.patientId) return;

    this.activeTabKey = this.tabs[0]?.key || 'skinWeekly';

    this.streams = {
      braden:                this.svc.list(this.patientId, 'braden'),
      skinWeekly:            this.svc.list(this.patientId, 'skinWeekly'),
      pressureInjuryWeekly:  this.svc.list(this.patientId, 'pressureInjuryWeekly'),
      progressNote:          this.svc.list(this.patientId, 'progressNote'),
      carePlan:              this.svc.list(this.patientId, 'carePlan'),
      vitalSigns:            this.svc.list(this.patientId, 'vitalSigns' as AssessmentType),
      antibiotic:            this.svc.list(this.patientId, 'antibiotic' as unknown as AssessmentType),
      nurseAdmission:        this.svc.list(this.patientId, 'nurseAdmission' as unknown as AssessmentType)
    };

    if (this.streams.vitalSigns) {
      this.vitalsOptions$ = this.streams.vitalSigns.pipe(
        map(rows => this.buildVitalsChartOptions(rows || []))
      );
    }
  }

  // ---------- Actions ----------

  openAdd(kind: TabKey) {
    this.dialog.open(AddAssessmentDialogComponent, {
      width: '960px',
      maxWidth: '98vw',
      data: { patientId: this.patientId, type: kind as unknown as AssessmentType }
    });
  }

  openVitalsTrend() {
    this.dialog.open(VitalsTrendDialogComponent, {
      width: '1024px',
      maxWidth: '98vw',
      data: { patientId: this.patientId }
    });
  }

  openPdf(a: Assessment) {
    const url = (a as LooseAssessment).pdfUrl as string | undefined;
    if (url) window.open(url, '_blank');
  }

  viewAssessment(a: Assessment) {
    this.openPdf(a);
  }

  updateAssessment(_a: Assessment) {}
  discontinueAssessment(_a: Assessment) {}

  // ---------- Helpers template ----------

  trackById = (_: number, a: Assessment) => a.id;

  /** Date sécurisée pour pipe Angular */
  displayDateOf(a: Assessment): Date | null {
    const la = a as LooseAssessment;
    const v: any = la?.createdAt ?? la?.answers?.assessedAt ?? la?.answers?.measuredAt ?? la?.measuredAt;
    if (!v) return null;
    if (typeof v?.toDate === 'function') return v.toDate();
    if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000);
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }

  /** Détermine le "kind" de la ligne d’après sa forme */
  rowKind(a: Assessment): string {
    const la = a as LooseAssessment;
    if (typeof la?.kind === 'string' && la.kind) return la.kind;
    const ans = la?.answers || la;
    if (ans?.braden) return 'braden';
    if (ans?.skinWeekly) return 'skinWeekly';
    if (ans?.pressureInjuryWeekly) return 'pressureInjuryWeekly';
    if (ans?.progressNote) return 'progressNote';
    if (ans?.carePlan) return 'carePlan';
    if (ans?.antibiotic) return 'antibiotic';
    const hasVitalsFlat =
      ['systolic','diastolic','heartRate','respiratoryRate','temperatureC','spo2'].some(k => ans?.[k] != null);
    if (hasVitalsFlat || ans?.vitals) return 'vitalSigns';
    return (la?.program || 'assessment') as string;
  }

  /** Sélecteur générique pour le tableau */
  vs(a: Assessment, key: string): any {
    const la = a as LooseAssessment;
    const ans = la?.answers || la;

    if (ans && key in (ans as any)) return (ans as any)[key];

    // braden
    if ((ans as any)?.braden) {
      if (key === 'score' || key === 'total') return (ans as any).braden.total ?? la?.score ?? null;
      if (key === 'risk' || key === 'riskText') return (ans as any).braden.riskText ?? null;
      if (key === 'date') return (ans as any).braden.date ?? null;
    }

    // skinWeekly
    if ((ans as any)?.findings && key === 'findings') return (ans as any).findings;
    if ((ans as any)?.skinWeekly) {
      if (key === 'findings') {
        const sw = (ans as any).skinWeekly;
        const cond = sw?.conditions || {};
        const pos = Object.entries(cond)
          .filter(([k, v]) => k !== 'otherText' && v === true)
          .map(([k]) => this.prettyCond(k));
        const other = cond.otherText ? [`Other: ${cond.otherText}`] : [];
        return [...pos, ...other].join(', ');
      }
      if (key in (ans as any).skinWeekly) return (ans as any).skinWeekly[key];
    }

    // pressureInjuryWeekly
    if ((ans as any)?.pressureInjuryWeekly && key in (ans as any).pressureInjuryWeekly) {
      return (ans as any).pressureInjuryWeekly[key];
    }

    // progressNote
    if ((ans as any)?.progressNote && key in (ans as any).progressNote) {
      return (ans as any).progressNote[key];
    }

    // carePlan
    if ((ans as any)?.carePlan && key in (ans as any).carePlan) {
      return (ans as any).carePlan[key];
    }

    // antibiotic
    if ((ans as any)?.antibiotic) {
      const ab = (ans as any).antibiotic;
      if (key === 'medication') return ab?.core?.medication ?? null;
      if (key === 'prescriber') return ab?.core?.prescriber ?? null;
      if (key === 'indication') return ab?.core?.indication ?? null;
      if (key in ab) return ab[key];
    }

    // vitals
    if ((ans as any)?.vitals && key in (ans as any).vitals) return (ans as any).vitals[key];

    return null;
  }

  private prettyCond(key: string): string {
    switch (key) {
      case 'intact': return 'Skin intact';
      case 'dry': return 'Dry';
      case 'rash': return 'Rash';
      case 'plaques': return 'Plaques';
      case 'callouses': return 'Callouses';
      case 'redness': return 'Redness';
      case 'skinTears': return 'Skin tears';
      case 'blisters': return 'Blisters';
      case 'openAreas': return 'Open areas, not skin tears';
      default: return key;
    }
  }

  // ---------- Charts (ECharts) ----------

  private toDate(v: any): Date {
    if (!v) return new Date(0);
    if (typeof v?.toDate === 'function') return v.toDate();
    if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000);
    return new Date(v);
  }

  private numOrNull(v: any): number | null {
    if (v === '' || v === null || v === undefined) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    if (typeof v === 'string') {
      let s = v.trim();
      if (!s) return null;
      if (s.endsWith('%')) s = s.slice(0, -1);
      s = s.replace(',', '.');
      if (/^\d+\s*\/\s*\d+$/.test(s)) return null; // ex. "115/85" -> ignoré ici
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }

  private parseBpPair(v: any): { sys: number|null; dia: number|null } {
    if (typeof v !== 'string') return { sys: null, dia: null };
    const m = v.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
    if (!m) return { sys: null, dia: null };
    const sys = Number(m[1]), dia = Number(m[2]);
    return {
      sys: Number.isFinite(sys) ? sys : null,
      dia: Number.isFinite(dia) ? dia : null
    };
  }

  onChartInit(e: ECharts) {
    this.vitalsChart = e;
    setTimeout(() => this.vitalsChart?.resize(), 0);
  }

  onTabChange(evt: any) {
    const idx = evt?.index ?? 0;
    this.activeTabKey = this.tabs[idx]?.key || this.activeTabKey;
    setTimeout(() => this.vitalsChart?.resize(), 0);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.vitalsChart?.resize();
  }

  // ---------- PDF ----------

  async compileAdmission(): Promise<void> {
    if (!this.patientId || this.generating) return;
    this.generating = true;
    const tab = window.open('about:blank', '_blank');
    try {
      const url = await this.svc.compileAdmission(this.patientId);
      if (url) {
        if (tab) tab.location.href = url; else window.open(url, '_blank');
        this.snack.open('Admission PDF ready', 'Open', { duration: 3000 })
          .onAction().subscribe(() => window.open(url, '_blank'));
      } else {
        throw new Error('No URL returned');
      }
    } catch (e: any) {
      if (tab) tab.close();
      this.snack.open(`Failed to generate Admission PDF: ${e?.message || e}`, 'Dismiss', { duration: 5000 });
    } finally {
        this.generating = false; // ✅ correction
    }
  }

  async compileDischarge(): Promise<void> {
    if (!this.patientId || this.generating) return;
    this.generating = true;
    const tab = window.open('about:blank', '_blank');
    try {
      const url = await this.svc.compileDischarge(this.patientId);
      if (url) {
        if (tab) tab.location.href = url; else window.open(url, '_blank');
        this.snack.open('Discharge PDF ready', 'Open', { duration: 3000 })
          .onAction().subscribe(() => window.open(url, '_blank'));
      } else {
        throw new Error('No URL returned');
      }
    } catch (e: any) {
      if (tab) tab.close();
      this.snack.open(`Failed to generate Discharge PDF: ${e?.message || e}`, 'Dismiss', { duration: 5000 });
    } finally {
      this.generating = false;
    }
  }

  /** OPTIONS ECHARTS — version corrigée (pas d’erreurs TS) */
  private buildVitalsChartOptions(rows: Assessment[]): EChartsOption {
    // tri chronologique (measuredAt > answers.measuredAt > createdAt)
    const sorted = [...rows].sort((a: any, b: any) =>
      +this.toDate(a?.measuredAt ?? a?.answers?.measuredAt ?? a?.createdAt) -
      +this.toDate(b?.measuredAt ?? b?.answers?.measuredAt ?? b?.createdAt)
    );

    // travaille en LooseAssessment à partir d’ici
    const lax = sorted as unknown as LooseAssessment[];

    const MAX = {
      systolic: 250,
      diastolic: 180,
      heartRate: 250,
      respiratoryRate: 80,
      temperatureC: 45,
      spo2: 100
    } as const;

    // accès tolérant (plat ou answers.vitals.{k})
    const get = (a: LooseAssessment, k: keyof typeof MAX) =>
      a?.answers?.[k] ?? a?.answers?.vitals?.[k] ?? a?.vitals?.[k] ?? (a as any)[k];

    // construit des paires [time, value] filtrées
    const pairs = (key: keyof typeof MAX) => {
      const cap = MAX[key];
      return lax
        .map((a: LooseAssessment) => {
          const t = +this.toDate(a?.measuredAt ?? a?.answers?.measuredAt ?? a?.createdAt);
          const v = this.numOrNull(get(a, key));
          if (v == null) return null;
          if (v < 0 || v > cap) return null;
          return [t, v] as [number, number];
        })
        .filter(Boolean) as [number, number][];
    };

    const sSys = pairs('systolic');
    const sDia = pairs('diastolic');
    const sHR  = pairs('heartRate');
    const sRR  = pairs('respiratoryRate');
    const sTC  = pairs('temperatureC');
    const sSp  = pairs('spo2');

    const series = [
      sSys.length ? { name: 'Systolic',  type: 'line', showSymbol: true, smooth: true, data: sSys } : null,
      sDia.length ? { name: 'Diastolic', type: 'line', showSymbol: true, smooth: true, data: sDia } : null,
      sHR.length  ? { name: 'HR',        type: 'line', showSymbol: true, smooth: true, data: sHR } : null,
      sRR.length  ? { name: 'RR',        type: 'line', showSymbol: true, smooth: true, data: sRR } : null,
      sTC.length  ? { name: 'Temp °C',   type: 'line', showSymbol: true, smooth: true, data: sTC } : null,
      sSp.length  ? { name: 'SpO₂',      type: 'line', showSymbol: true, smooth: true, data: sSp } : null,
    ].filter(Boolean) as any[];

    // Axe Y borné pour lisibilité quand pas de valeurs extrêmes
    const yAxis: any = { type: 'value', scale: true };
    const allVals = [...sSys, ...sDia, ...sHR, ...sRR, ...sTC, ...sSp].map(([, v]) => v);
    if (allVals.length) {
      const vmax = Math.max(...allVals);
      if (vmax <= 200) { yAxis.min = 0; yAxis.max = 200; }
    } else {
      yAxis.min = 0; yAxis.max = 200;
    }

    return {
      animation: true,
      tooltip: { trigger: 'axis' },
      legend: { top: 0 },
      grid: { left: 48, right: 24, top: 40, bottom: 60 },
      xAxis: { type: 'time' },
      yAxis,
      dataZoom: [
        { type: 'inside' },
        { type: 'slider', height: 20, bottom: 24 }
      ],
      series: series.length ? series : [{ name: 'No data', type: 'line', data: [] }]
    };
  }
}
