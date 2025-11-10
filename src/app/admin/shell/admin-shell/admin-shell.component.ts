import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountDialogComponent } from 'src/app/COMPONENT/account-dialog/account-dialog.component';
import { AuthService } from 'src/app/service/auth.service';


@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss']
})
export class AdminShellComponent {
  opened = true;
  isMobile = false;
  userName = this.auth.getUserName() ?? 'Admin';

  constructor(private auth: AuthService, private router: Router, private dialog: MatDialog) {
    this.isMobile = window.innerWidth < 1024;
    this.opened = !this.isMobile;
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
    this.auth.logout();
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
