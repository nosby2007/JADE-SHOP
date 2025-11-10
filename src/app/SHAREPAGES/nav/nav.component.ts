import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';



@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  userName: string | null = '';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Vérifier l'état de connexion de l'utilisateur
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isUserLoggedIn = loggedIn;
    });

    // Abonnement pour obtenir le nom de l'utilisateur connecté
    this.authService.userName$.subscribe((name) => {
      this.userName = name;
    });
  }
}