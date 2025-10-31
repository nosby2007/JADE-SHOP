import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private auth: AuthService, private router: Router) {
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
}
