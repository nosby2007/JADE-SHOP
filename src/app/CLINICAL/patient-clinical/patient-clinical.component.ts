import { Component, OnInit, ViewChild } from '@angular/core';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { EditPatientComponent } from 'src/app/COMPONENT/edit-patient/edit-patient.component';
import { Patient } from 'src/app/patient.model';

@Component({
  selector: 'app-patient-clinical',
  templateUrl: './patient-clinical.component.html',
  styleUrls: ['./patient-clinical.component.scss']
})
export class PatientClinicalComponent implements OnInit {
  displayedColumns: string[] = ['name', 'gender', 'dob', 'phone', 'email', 'action'];
  dataSource = new MatTableDataSource<Patient>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private patientService: PatientService, private dialog: MatDialog) {}

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
    const dialogRef = this.dialog.open(EditPatientComponent, {
      width: '600px',
      data: patient // Pass the selected patient
    });
  
    dialogRef.afterClosed().subscribe((updatedPatient: Patient) => {
      if (updatedPatient) {
        this.patientService.updatePatient(updatedPatient.id!, updatedPatient).then(() => {
          console.log('Patient updated successfully');
          this.fetchPatients(); // Refresh the list
        }).catch((error) => {
          console.error('Error updating patient:', error);
        });
      }
    });
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
