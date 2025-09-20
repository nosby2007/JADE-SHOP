import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CountDownModalComponent } from '../FORMULAIRE/count-down-modal/count-down-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private timeout: any;
  private countdownInterval: any;
  private readonly timeoutDuration = 2 * 60 * 10000; // 2 minutes
  private readonly countdownDuration = 10; // 10 secondes pour confirmer

  constructor(private router: Router, private ngZone: NgZone, private dialog:MatDialog, private auth: AngularFireAuth,) {
    this.initActivityListener();
  }

  initActivityListener(): void {
    ['mousemove', 'keydown', 'click'].forEach((event) => {
      window.addEventListener(event, () => this.resetTimeout());
    });

    this.startTimeout();
  }

  private startTimeout(): void {
    this.clearTimeout();
    this.timeout = setTimeout(() => {
      this.startCountdown();
    }, this.timeoutDuration);
  }

  private resetTimeout(): void {
    this.startTimeout();
  }

  private clearTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown(): void {
    let countdown = this.countdownDuration;
  
    const dialogRef = this.dialog.open(CountDownModalComponent, {
      data: { countdown },
    });
  
    const countdownInterval = setInterval(() => {
      countdown--;
      dialogRef.componentInstance.data.countdown = countdown;
  
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        dialogRef.close(false); // Fermer automatiquement si le temps est écoulé
      }
    }, 1000);
  
    dialogRef.afterClosed().subscribe((result) => {
      clearInterval(countdownInterval);
      if (result) {
        this.resetTimeout();
      } else {
        this.logoutUser();
      }
    });
 }

  private logoutUser(): void {
    clearInterval(this.countdownInterval);
    this.auth.signOut().then(() => {
      console.log('Utilisateur déconnecté via Firebase.');
    });

    // Supprimer toutes les données locales
    localStorage.clear();
    sessionStorage.clear();

    // Rediriger vers la page de connexion
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }
}
