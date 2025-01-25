import { Component, OnInit, ViewChild } from '@angular/core';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { EditPatientComponent } from 'src/app/COMPONENT/edit-patient/edit-patient.component';
import { Patient } from 'src/app/patient.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-patient-clinical',
  templateUrl: './patient-clinical.component.html',
  styleUrls: ['./patient-clinical.component.scss']
})
export class PatientClinicalComponent implements OnInit {
  displayedColumns: string[] = ['name', 'gender', 'dob', 'phone', 'email', 'action'];
  displayedColumns2: string [] = [/*'firstName',*/'name','email','phone', /*'department',*/ /*'ordre',*//*'date',*/'gender',/*'profession',*/ /*'PaidType',*//*'cni',*/'action']
  dataSource = new MatTableDataSource<Patient>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private patientService: PatientService, private dialog: MatDialog, private router:Router) {}

  ngOnInit(): void {
    this.fetchPatients();
  }

  fetchPatients(): void {
    this.patientService.getPatients().subscribe(
      (patients: Patient[]) => {
        this.dataSource.data = patients;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.error('Error fetching patients:', error);
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editPatient(patient: Patient): void | undefined {
    this.router.navigate(['update', patient]);
  }

  deletePatient(patientId: string): void {
    this.patientService.deletePatient(patientId).then(() => {
      console.log('Patient deleted successfully');
      this.fetchPatients();
    }).catch((error: any) => {
      console.error('Error deleting patient:', error);
    });
  }
}
