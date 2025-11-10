import { Component, OnInit } from '@angular/core';
// N'oublie pas d'importer les modules et services nécessaires en haut du fichier
import { HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { formatDate } from '@angular/common';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

interface UiUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// forward refs
import { AccountDialogComponent } from 'src/app/COMPONENT/account-dialog/account-dialog.component';

@Component({
  selector: 'app-provider-shell',
  templateUrl: './provider-shell.component.html',
  styleUrls: ['./provider-shell.component.scss']
})
export class ProviderShellComponent implements OnInit {

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
  title = 'Provider Dashboard';
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

  initials(name?: string | null, email?: string | null): string {
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
    this.router.navigate(['/emar', 'dashboard']);
  }
}

