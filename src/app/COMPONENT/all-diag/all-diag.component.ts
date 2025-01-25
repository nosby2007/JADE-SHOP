import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PatientService } from 'src/app/SERVICE/patient.service';

@Component({
  selector: 'app-all-diag',
  templateUrl: './all-diag.component.html',
  styleUrls: ['./all-diag.component.scss']
})
export class AllDiagComponent implements OnInit {

  
  patients: any[] = [];
  selectedPatientId: string | null = null;
  selectedPatientName: string | null = null;
  diagnostics: any[] = [];
  displayedColumns: string[] = ['date', 'code', 'description', 'commentaire', 'rang', 'classification', 'username'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }


  constructor(private patientService: PatientService) {}

  totalDiagnostic: number = 0;

updateSummary(): void {
  this.totalDiagnostic = this.dataSource.data.length;
}

  ngOnInit(): void {
    this.loadPatients();
    this.loadDiagnostic
    
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

  loadDiagnostic(patientId: string, patientName: string): void {
    this.selectedPatientId = patientId;
    this.selectedPatientName = patientName;
    this.patientService.getDiagnostic(patientId).subscribe(
      (diagnostics) => {
        this.diagnostics = diagnostics;
        this.dataSource.data = diagnostics;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log('Diagnostique chargées :', diagnostics);
      },
      (error) => {
        console.error('Erreur lors du chargement des Diagnostiques:', error);
      }
    );
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }



  exportToCSV(): void {
    const csvData = this.dataSource.data.map((diagnostic) => ({
      category: diagnostic.date,
      Type: diagnostic.type,
      method: diagnostic.method,
      Prescriber: diagnostic.prescriber
    }));
    const csvString = this.convertToCSV(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'diagnostic.csv');
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
