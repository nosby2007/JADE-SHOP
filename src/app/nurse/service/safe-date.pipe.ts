// shared/pipes/safe-date.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'safeDate' })
export class SafeDatePipe implements PipeTransform {
  transform(value: any, format = 'short'): any {
    if (!value) return '—';
    try {
      const date = value.toDate ? value.toDate() : value;
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: format === 'short' ? 'short' : 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return value;
    }
  }
}
