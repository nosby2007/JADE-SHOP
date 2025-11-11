// src/app/service/inactivity.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CountDownComponent } from '../COMPONENT/count-down/count-down.component';

@Injectable({ providedIn: 'root' })
export class InactivityService {
  private timeoutHandle: any | null = null;
  private countdownHandle: any | null = null;
  private listenersInitialized = false;

  // ✅ real 2 minutes (120000 ms)
  private readonly timeoutDuration = 2 * 60 * 1000;
  private readonly countdownDuration = 10; // seconds

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private auth: AngularFireAuth,
  ) {
    this.initActivityListener();
  }

  initActivityListener(): void {
    if (this.listenersInitialized) return;
    this.listenersInitialized = true;

    ['mousemove', 'keydown', 'click', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, () => this.resetTimeout(), { passive: true });
    });

    this.startTimeout();
  }

  private startTimeout(): void {
    this.clearAllTimers();
    this.timeoutHandle = setTimeout(() => this.startCountdown(), this.timeoutDuration);
  }

  private resetTimeout(): void {
    this.startTimeout();
  }

  private clearAllTimers(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    if (this.countdownHandle) {
      clearInterval(this.countdownHandle);
      this.countdownHandle = null;
    }
  }

  private startCountdown(): void {
    let remaining = this.countdownDuration;
    const total = this.countdownDuration;

    const dialogRef = this.dialog.open(CountDownComponent, {
      disableClose: true,
      data: { countdown: remaining, totalSeconds: total },
    });

    // ✅ ensure UI updates each tick (NgZone.run)
    this.clearAllTimers();
    this.countdownHandle = setInterval(() => {
      remaining--;

      this.ngZone.run(() => {
        if (dialogRef.componentInstance?.data) {
          dialogRef.componentInstance.data.countdown = remaining;
        }
      });

      if (remaining <= 0) {
        this.clearAllTimers();
        dialogRef.close(false); // auto sign-out
      }
    }, 1000);

    dialogRef.afterClosed().subscribe(keepAlive => {
      this.clearAllTimers();
      if (keepAlive) {
        this.resetTimeout();   // user chose to stay
      } else {
        this.logoutUser();     // user allowed timeout or clicked Sign out
      }
    });
  }

  private logoutUser(): void {
    this.clearAllTimers();
    this.auth.signOut().catch(() => {});
    localStorage.clear();
    sessionStorage.clear();
    this.ngZone.run(() => this.router.navigate(['/login']));
  }
}
