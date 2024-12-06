import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { AuthService } from './SERVICE/auth.service';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isUserLoggedIn: boolean = false;
 userName: string | null = '';
  showNavbar: boolean = true;
  title = 'soeurette-managment';
  today = new Date();
  jstoday = '';
  loggedInUser: any;
  user!: string;
  mynumber: any;
  constructor(private router:Router, public authService: AuthService) {
    this.jstoday = formatDate(this.today, 'MMM dd, yyyy , hh:mm:ss a', 'en-US');
    this.mynumber = +911234567890;
  }
  ngOnInit(): void {
     this.loggedInUser = sessionStorage.getItem('user');
     this.router.events.subscribe(() => {
      // Masquer la barre de navigation sur les pages de connexion et d'inscription
      const currentUrl = this.router.url;
      if (currentUrl === '/login' || currentUrl === '/register') {
        this.showNavbar = false;
      } else {
        this.showNavbar = true;
      }
    });
    this.authService.userName$.subscribe((name) => {
      this.userName = name;
    });
  }
  logout() {
    this.loggedInUser = null;
    this.router.navigate(['login']);
  }
 }

 