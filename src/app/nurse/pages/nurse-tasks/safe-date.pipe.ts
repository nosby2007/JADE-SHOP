
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeDate'
})
export class SafeDatePipe implements PipeTransform {

  transform(value: any, format: string = 'short'): string {
    if (!value) return '';

    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (value && typeof value.toDate === 'function') {
      // Firebase Timestamp
      date = value.toDate();
    } else {
      try {
        date = new Date(value);
        if (isNaN(date.getTime())) {
            return ''; // Invalid date
        }
      } catch (e) {
        return ''; // Error parsing date
      }
    }

    // Use Angular's DatePipe for formatting
    return new (require('@angular/common').DatePipe)('en-US').transform(date, format);
  }

}
