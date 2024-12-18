import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'timestampToDate',
})
export class TimestampToDatePipe implements PipeTransform {
  transform(value: any): Date | null {
    if (value instanceof Timestamp) {
      return value.toDate();
    } else if (value instanceof Date) {
      return value;
    }
    return null; // Return null if not a valid Timestamp or Date
  }
}
