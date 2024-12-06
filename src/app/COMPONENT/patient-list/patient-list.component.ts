import { Component, OnInit, ViewChild } from '@angular/core';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string [] = ['name','email', 'phone', 'docteur', 'paiement', 'dob']

  @ViewChild(MatPaginator,  { static: true }) paginator!:MatPaginator;
  @ViewChild(MatSort,  { static: true }) sort!:MatSort;
  

  patients: any[] = [];
  constructor(private patientService: PatientService, router:Router) { }

  ngOnInit(): void {
    this.patientService.patient$.subscribe((patients: any[]) => {
      // Ajout d'un code temporel à chaque patient pour démonstration
      patients.forEach(patient => {
        patient.timestamp = new Date();
      });
      this.dataSource.data = patients;
    });
  }

  ngAfterViewInit(): void {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  
  editPatient(patient: any): void {
    // Logic to edit the patient
    console.log('Editing patient:', patient);
  }

  deletePatient(patientId: string) {
    this.patientService.deletePatient(patientId).then(() => {
      console.log('patient  deleted successfully');
    }).catch((error) => {
      console.error('Error deleting appointment: ', error);
    });
  }
}                                    