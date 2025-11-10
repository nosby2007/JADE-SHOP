// src/app/reception/shell/reception-shell/reception-shell.component.ts
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { map, Subject, takeUntil } from 'rxjs';

import firebase from 'firebase/compat/app';
import { AuthService } from 'src/app/service/auth.service';
import { AccountDialogComponent } from 'src/app/COMPONENT/account-dialog/account-dialog.component';
import { MatDialog } from '@angular/material/dialog';

type UiUser = {
  displayName?: string|null;
  email?: string|null;
  photoURL?: string|null;
};

@Component({
  selector: 'app-reception-shell',
  templateUrl: './reception-shell.component.html',
  styleUrls: ['./reception-shell.component.scss']
})
export class ReceptionShellComponent implements OnInit, OnDestroy {
  opened = true;
  isMobile = false;

  private afAuth = inject(AngularFireAuth);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    this.jstoday = formatDate(this.today, 'MMM dd, yyyy , hh:mm:ss a', 'en-US');

    // --- Demo/mock. Remove in prod.
    this.mynumber = +911234567890;
    this.nurseDetails = {
      createdAt: firebase.firestore.Timestamp.fromMillis(1734670800 * 1000),
    };
    const ts: any = this.nurseDetails?.createdAt;
    if (ts && typeof ts.toDate === 'function') {
      this.nurseDetails.createdAt = ts.toDate();
    }

    this.items = this.items.map(item => ({
      ...item,
      dateField: item?.dateField && typeof item.dateField.toDate === 'function'
        ? item.dateField.toDate()
        : (item?.dateField ?? null)
    }));
  }

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

  selectedPatientId: string | null = null;

  createdDate = new Date();
  isUserLoggedIn = false;
  userName: string | null = '';
  showNavbar = true;
  title = 'Reception Dashboard';
  today = new Date();
  jstoday = '';
  loggedInUser: any;
  user!: string;
  mynumber: any;
  nurseDetails: any;
  items: any[] = [];

  async ngOnInit() {
    // Initial responsive state
    this.onResize();

    // Ensure fresh claims once on shell load (prevents rule mismatches)
    await this.authService.ensureFreshToken().catch(() => {});

    this.authService.userName$
      .pipe(takeUntil(this.destroy$))
      .subscribe(displayName => (this.userName = displayName));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initials(name?: string|null, email?: string|null): string {
    const src = (name && name.trim()) || (email && email.split('@')[0]) || '';
    if (!src) return '👤';
    const parts = src.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => (p[0] || '').toUpperCase()).join('') || '👤';
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
}
