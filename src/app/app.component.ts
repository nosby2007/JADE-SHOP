import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';

import { Timestamp } from 'firebase/firestore';
import { AuthService } from './service/auth.service';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  createdDate = new Date();
  isUserLoggedIn: boolean = false;
 userName: string | null = '';
  showNavbar: boolean = true;
  title = 'soeurette-managment';
  today = new Date();
  jstoday = '';
  loggedInUser: any;
  user!: string;
  mynumber: any;
  nurseDetails: any; // Assuming this contains the Firestore data
  items: any[] = []; // Define the items property
  constructor(private router:Router, public authService: AuthService) {
    this.jstoday = formatDate(this.today, 'MMM dd, yyyy , hh:mm:ss a', 'en-US');
    this.mynumber = +911234567890;

    this.nurseDetails = {
      createdAt: Timestamp.fromMillis(1734670800 * 1000), // Mock Firestore Timestamp
    };

    // Convert Firestore Timestamp to JavaScript Date
    if (this.nurseDetails.createdAt instanceof Timestamp) {
      this.nurseDetails.createdAt = this.nurseDetails.createdAt.toDate('today');
      this.items = this.items.map(item => {
      return {
        ...item,
        dateField: item.dateField ? item.dateField.toDate() : null // Convertir ou définir comme null
      };
    });
    
  }
  }
  ngOnInit(): void {
    this.authService.userName$.subscribe((name) => {
      this.userName = name;
    });
  }

  
  logout() {
    this.loggedInUser = null;
    this.router.navigate(['login']);
  }
 }