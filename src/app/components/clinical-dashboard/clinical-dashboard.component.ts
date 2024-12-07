import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-clinical-dashboard',
  templateUrl: './clinical-dashboard.component.html',
  styleUrls: ['./clinical-dashboard.component.scss']
})
export class ClinicalDashboardComponent implements OnInit {

  antibioticMedications = [
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    { residentName: 'Andrea Cliett', order: 'Amoxicillin 500mg', schedule: 'Routine', medicationClass: 'PENICILLINS', orderStatus: 'Active', startDate: '12/3/2024', endDate: '12/8/2024', orderedBy: 'Jones, Cassandra' },
    // Add more entries here
  ];

  progressNotes = [
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    { date: '12/6/2024', name: 'Smith, Linda', type: 'Nursing: Infection Note (M)' },
    // Add more entries here
  ];
  medPasses = [
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    { record: 'MAR', shift: 'EMR 0700-1900 C (Fri)', assignment: '100 Cart (EMAR)' },
    // More data here
  ];

  labResults = [
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    { reportedDate: '11/27/2024 16:30', collectionDate: '11/26/2024 23:01', residentName: 'Lee, Louis', location: '200 213-C', reportName: 'Comprehensive Metabol...' },
    // More data here
  ];

  clinicalAlerts = [
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    { name: 'HARRIS, JIMMY (4827)', alert: 'Alarm Batteries Not Working When Checked' },
    // More data here
  ];

  constructor() { }

  ngOnInit(): void { }
}