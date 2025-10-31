import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { NurseTask } from "../models/patient.model";

// utils.ts (ou directement dans ton service de tâches)
export function stripUndefinedDeep<T>(val: T): T {
    if (Array.isArray(val)) return val.map(v => stripUndefinedDeep(v)) as any;
    if (val && typeof val === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(val as any)) {
        if (v !== undefined) out[k] = stripUndefinedDeep(v as any);
      }
      return out;
    }
    return val;
  }
  
  type RepeatUnit = 'day'|'week'|'month'|'year';
  export function sanitizeRepeat(raw: any): any {
    if (!raw) return undefined;
  
    const enabled = !!raw.enabled;
    if (!enabled) return { enabled: false }; // on coupe tout le reste
  
    // si enabled = true, on exige un interval > 0 + unit
    const interval = Number(raw.interval);
    const unit = (raw.unit as RepeatUnit) ?? undefined;
  
    if (!interval || interval < 1 || !unit) {
      // si info manquante => on désactive proprement
      return { enabled: false };
    }
  
    // startDate: accepte Date | Timestamp | string, sinon on l’omet
    const startDate = raw.startDate ?? undefined;
  
    return stripUndefinedDeep({
      enabled: true,
      interval,    // nombre ≥ 1
      unit,        // 'day'|'week'|'month'|'year'
      startDate    // optionnel
    });
  }

  export function addMonths(date: Date, n: number) {
    const d = new Date(date);
    const m = d.getMonth() + n;
    d.setMonth(m);
    // corriger overflow (31 -> 30/28 etc.)
    if (d.getMonth() !== (m % 12 + 12) % 12) d.setDate(0);
    return d;
  }
  
  export function nextDate(from: Date, rule: Required<Pick<NonNullable<NurseTask['repeat']>,'every'|'unit'>> & Partial<NonNullable<NurseTask['repeat']>>): Date[] {
    // Retourne un **tableau** car on peut avoir plusieurs jours dans la semaine (byWeekday)
    if (rule.unit === 'day') {
      return [new Date(from.getTime() + rule.every*24*3600*1000)];
    }
    if (rule.unit === 'week') {
      if (!rule.byWeekday || !rule.byWeekday.length) {
        // “toutes les X semaines” à même weekday
        return [new Date(from.getTime() + rule.every*7*24*3600*1000)];
      } else {
        // ex: Lundi/Mercredi -> produire les prochains jours de la semaine future
        const base = new Date(from.getTime() + (rule.every*7)*24*3600*1000);
        const res: Date[] = [];
        rule.byWeekday.sort().forEach(wd => {
          const d = new Date(base);
          const delta = (wd - d.getDay() + 7) % 7;
          d.setDate(d.getDate() + delta);
          res.push(d);
        });
        return res;
      }
    }
    // month
    return [addMonths(from, rule.every)];
  }
  
  export function toTs(d: Date) {
    return firebase.firestore.Timestamp.fromDate(d);
  }

  // Robust converters – accept Date | string | number | Firebase TS | {seconds} | null

export function asDate(v: any): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return isNaN(+v) ? null : v;

  // Firestore Timestamp-like
  if (typeof v?.toDate === 'function') {
    try {
      const d = v.toDate();
      return isNaN(+d) ? null : d;
    } catch { return null; }
  }
  if (typeof v?.seconds === 'number') {
    const ms = v.seconds * 1000 + Math.floor((v.nanoseconds ?? 0) / 1e6);
    const d = new Date(ms);
    return isNaN(+d) ? null : d;
  }

  // Primitives (e.g., '2025-10-30' or epoch ms)
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }

  return null;
}



