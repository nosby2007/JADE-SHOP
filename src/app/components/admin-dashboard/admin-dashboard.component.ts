import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  title = 'Tableau de bord Admin';
  currentDate = new Date();
  payers = ['Payer 1', 'Payer 2', 'Payer 3'];

  displayedColumns = ['resident', 'location', 'reason', 'status'];
  incompleteAssessments = [
    { resident: 'John Doe', location: 'Room 101', reason: 'Follow-up', status: 'Pending' },
    { resident: 'Jane Smith', location: 'Room 202', reason: 'Initial', status: 'Completed' },
  ];

  constructor() {}

  ngOnInit(): void {}

  refresh(): void {
    console.log('Refreshing data...');
    // Logic to fetch new data from the API
  }
}

