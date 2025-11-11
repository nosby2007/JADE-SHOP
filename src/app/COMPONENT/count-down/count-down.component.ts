// src/app/COMPONENT/count-down/count-down.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

type CountDownData = {
  countdown: number;      // seconds remaining (mutable)
  totalSeconds?: number;  // total seconds for the timer (optional, defaults to 10)
};

@Component({
  selector: 'app-count-down',
  templateUrl: './count-down.component.html',
  styleUrls: ['./count-down.component.scss']
})
export class CountDownComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CountDownData,
    private dialogRef: MatDialogRef<CountDownComponent>
  ) {}

  get secondsLeft(): number {
    const v = this.data?.countdown ?? 0;
    return v > 0 ? v : 0;
  }

  get total(): number {
    const t = this.data?.totalSeconds ?? 10;
    return t > 0 ? t : 10;
  }

  // ✅ This is what your template needs
  get percentLeft(): number {
    // clamp 0..100 and round for nice display
    const pct = (this.secondsLeft / this.total) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }

  stayLoggedIn(): void {
    this.dialogRef.close(true);
  }

  logout(): void {
    this.dialogRef.close(false);
  }
}
