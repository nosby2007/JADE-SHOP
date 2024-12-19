import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PatientService } from 'src/app/SERVICE/patient.service';
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  patients: any[] = [];
  selectedPatientId: string | null = null;
  selectedPatientName: string | null = null;
  prescriptions: any[] = [];
  displayedColumns: string[] = ['date', 'type', 'method', 'prescriber', 'medication', 'route', 'routine', 'category'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }


  constructor(private patientService: PatientService) {}

  totalPrescriptions: number = 0;

updateSummary(): void {
  this.totalPrescriptions = this.dataSource.data.length;
}

  ngOnInit(): void {
    this.loadPatients();
    this. loadPrescriptions
    
  }
  

  loadPatients(): void {
    this.patientService.getPatients().subscribe(
      (patients) => {
        this.patients = patients;
        console.log('Patients chargés :', this.patients);
      },
      (error) => {
        console.error('Erreur lors du chargement des patients:', error);
      }
    );
  }

  loadPrescriptions(patientId: string, patientName: string): void {
    this.selectedPatientId = patientId;
    this.selectedPatientName = patientName;
    this.patientService.getPrescriptions(patientId).subscribe(
      (prescriptions) => {
        this.prescriptions = prescriptions;
        this.dataSource.data = prescriptions;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log('Prescriptions chargées :', prescriptions);
      },
      (error) => {
        console.error('Erreur lors du chargement des prescriptions:', error);
      }
    );
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }



  exportToCSV(): void {
    const csvData = this.dataSource.data.map((prescription) => ({
      category: prescription.date,
      Type: prescription.type,
      method: prescription.method,
      Prescriber: prescription.prescriber
    }));
    const csvString = this.convertToCSV(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'prescriptions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  convertToCSV(objArray: any[]): string {
    const headers = Object.keys(objArray[0]).join(',');
    const rows = objArray.map((obj) =>
      Object.values(obj).map((val) => `"${val}"`).join(',')
    );
    return `${headers}\n${rows.join('\n')}`;
  }
  
}