import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PatientService } from 'src/app/SERVICE/patient.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  patients: any[] = [];
  selectedPatientPrescriptions: any[] = [];
  selectedPatientName: string = '';
  displayedColumns: string[] = ['date', 'prescriber', 'time', 'method', 'routine', 'route', 'type'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe(
      (patients) => {
        this.patients = patients;
        console.log('Liste des patients:', this.patients); // Debug
      },
      (error) => {
        console.error('Erreur lors du chargement des patients:', error);
      }
    );
  }

  loadPrescriptionsForPatient(patientId: string, patientName: string): void {
    this.patientService.getPrescriptions(patientId).subscribe(
      (prescriptions) => {
        this.selectedPatientPrescriptions = prescriptions;
        this.selectedPatientName = patientName;
        console.log('Prescriptions pour le patient:', prescriptions); // Debug
      },
      (error) => {
        console.error('Erreur lors du chargement des prescriptions:', error);
      }
    );
  }
}
