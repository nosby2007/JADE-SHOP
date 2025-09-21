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
  