import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from 'src/app/core/api.service';

type Wound = {
  id: string;
  patientId: string;
  location: string;
  etiology: string;
  stage?: string;
  status: 'active'|'resolved'|'monitoring'|string;
  lastAssessmentAt?: number;
  createdAt?: number;
  acquired?: 'in-house'|'community'|string;
  thumbUrl?: string;  // tu peux hydrater depuis media si tu veux
  patient?: { displayName?: string; mrn?: string; room?: string; bed?: string };
};

@Component({
  selector: 'app-skin-wound-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private api = inject(ApiService);

  // filtres UI
  date = new FormControl<string>(new Date().toISOString().slice(0,10));
  tab: 'wounds'|'chart'|'locations' = 'wounds';
  filters = {
    types: [] as string[],
    acquired: [] as string[],
    locations: [] as string[]
  };

  // données
  wounds: Wound[] = [];
  loading = false;

  // KPI
  kpi = {
    new: 0,
    deteriorating: 0,
    stalled: 0,
    stable: 0,
    improving: 0,
    monitoring: 0,
    unknown: 0
  };

  ngOnInit() { this.load(); }

  async load(){
    this.loading = true;
    const to = this.date.value!;
    // exemple: 30 jours glissants
    const from = new Date(Date.now() - 30*864e5).toISOString().slice(0,10);

    this.api.listAllWounds({ from, to, limit: 200 }).subscribe((items:any) => {
      this.wounds = items;
      this.computeKpi();
      this.loading = false;
    }, _ => this.loading = false);
  }

  computeKpi(){
    const k = { new:0, deteriorating:0, stalled:0, stable:0, improving:0, monitoring:0, unknown:0 };
    // règle simple : tu l’adapteras à tes champs/algos
    for (const w of this.wounds){
      const status = (w as any).trend || w.status || 'unknown';
      if (w.createdAt && Date.now() - w.createdAt < 7*864e5) k.new++;
      switch (status) {
        case 'deteriorating': k.deteriorating++; break;
        case 'stalled':       k.stalled++; break;
        case 'stable':        k.stable++; break;
        case 'improving':     k.improving++; break;
        case 'monitoring':    k.monitoring++; break;
        default:              k.unknown++;
      }
    }
    this.kpi = k;
  }

  // helpers d’affichage
  lastEval(w:Wound){
    return w.lastAssessmentAt ? this.daysAgo(w.lastAssessmentAt) : '—';
  }
  daysAgo(ts:number){
    const d = Math.floor((Date.now()-ts)/864e5);
    return d===0 ? 'today' : d===1 ? '1 day ago' : `${d} days ago`;
  }

  // handlers UI
  setTab(t:'wounds'|'chart'|'locations'){ this.tab = t; }
  applyFilters(){ /* tu pourras appeler listAllWounds avec params */ }
}
