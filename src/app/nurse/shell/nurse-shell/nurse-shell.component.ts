// src/app/nurse/shell/nurse-shell/nurse-shell.component.ts
import { Component, HostListener, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { map } from 'rxjs';

// Si ton projet utilise firebase compat:
import firebase from 'firebase/compat/app';
import { AuthService } from 'src/app/service/auth.service';
import { AccountDialogComponent } from 'src/app/COMPONENT/account-dialog/account-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Patient } from '../../models/patient.model';
// (si tu es en modular: import { Timestamp } from 'firebase/firestore' et adapte le guard en bas)

 // <- ajuste le chemin si besoin

type UiUser = {
  displayName?: string|null;
  email?: string|null;
  photoURL?: string|null;
};

@Component({
  selector: 'app-nurse-shell',
  templateUrl: './nurse-shell.component.html',
  styleUrls: ['./nurse-shell.component.scss']
})
export class NurseShellComponent {
  // --------- services
  opened = true;
  isMobile = false;
  // --------- services
  private dialog = inject(MatDialog);
  private afAuth = inject(AngularFireAuth);
  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    // jstoday formaté une fois au chargement
    this.jstoday = formatDate(this.today, 'MMM dd, yyyy , hh:mm:ss a', 'en-US');

    // Démo/placeholder
    this.mynumber = +911234567890;

    // Mock nurseDetails + conversion Timestamp -> Date
    this.nurseDetails = {
      createdAt: firebase.firestore.Timestamp.fromMillis(1734670800 * 1000), // 2024-12-20 approx
    };

    const ts: any = this.nurseDetails?.createdAt;
    if (ts && typeof ts.toDate === 'function') {
      // ✅ bonne conversion
      this.nurseDetails.createdAt = ts.toDate();
    }

    // Exemple: normaliser des items potentiels
    this.items = this.items.map(item => ({
      ...item,
      dateField: item?.dateField && typeof item.dateField.toDate === 'function'
        ? item.dateField.toDate()
        : (item?.dateField ?? null)
    }));
  }

  // --------- observables & état UI
  user$ = this.afAuth.user.pipe(
    map(u => {
      this.isUserLoggedIn = !!u;
      this.loggedInUser = u;
      return {
        displayName: u?.displayName ?? null,
        email: u?.email ?? null,
        photoURL: u?.photoURL ?? null,
      } as UiUser;
    })
  );

  // Optionnel: si tu veux des liens patients/:id/…
  selectedPatientId: string | null = null;

  // --------- Tes champs / état
  createdDate = new Date();
  isUserLoggedIn: boolean = false;
  userName: string | null = '';
  showNavbar: boolean = true;
  title = 'Nurse Dashboard';
  today = new Date();
  jstoday = '';
  loggedInUser: any;
  user!: string;
  mynumber: any;
  nurseDetails: any;      // Données Firestore simulées ici
  items: any[] = [];      // Liste d’items (normalisés plus haut)

  ngOnInit(): void {
    // récupère le nom depuis ton AuthService
    this.authService.userName$.subscribe(displayName => {
      this.userName = displayName;
    });
  }

  initials(name?: string|null, email?: string|null): string {
    const src = (name && name.trim()) || (email && email.split('@')[0]) || '';
    if (!src) return '👤';
    const parts = src.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => (p[0] || '').toUpperCase()).join('') || '👤';
  }

  signOut() {
    this.authService.logout(); // si tu as une méthode sur ton AuthService
    this.loggedInUser = null;
    this.isUserLoggedIn = false;
    this.router.navigate(['login']);
  }

  @HostListener('window:resize')
        onResize() {
          this.isMobile = window.innerWidth < 1024;
          this.opened = !this.isMobile;
        }
      
        toggleSidenav() {
          this.opened = !this.opened;
        }
      
        logout() {
          this.authService.logout();
        }
      
        goto(path: string) {
          this.router.navigateByUrl(path);
          if (this.isMobile) this.opened = false;
        }

        openAccount() {
  this.dialog.open(AccountDialogComponent, {
    width: '720px',
    maxWidth: '96vw',
    autoFocus: false,
    restoreFocus: false,
    data: {}
  });
}

gotoemar() {
       this.router.navigate(['/emar', 'emar']);
     }
}
