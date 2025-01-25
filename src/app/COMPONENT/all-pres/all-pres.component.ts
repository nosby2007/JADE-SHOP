import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PatientService } from 'src/app/SERVICE/patient.service';

@Component({
  selector: 'app-all-pres',
  templateUrl: './all-pres.component.html',
  styleUrls: ['./all-pres.component.scss']
})
export class AllPresComponent implements OnInit {

  patients: any[] = [];
  selectedPatientId: string | null = null;
  selectedPatientName: string | null = null;
  progressNotes: any[] = [];
  displayedColumns: string[] = ['time', 'noteText', 'username', 'effectiveDate', 'type','carePlanItem', 'type' ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }


  constructor(private patientService: PatientService) {}

  totalProgressNote: number = 0;

updateSummary(): void {
  this.totalProgressNote = this.dataSource.data.length;
}

  ngOnInit(): void {
    this.loadPatients();
    this.loadProgressNote
    
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

  loadProgressNote(patientId: string, patientName: string): void {
    this.selectedPatientId = patientId;
    this.selectedPatientName = patientName;
    this.patientService.getProgressNote(patientId).subscribe(
      (progressNotes) => {
        this.progressNotes = progressNotes;
        this.dataSource.data = progressNotes;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log('progressNotes chargées :', progressNotes);
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
    const csvData = this.dataSource.data.map((progressNote) => ({
      category: progressNote.date,
      Type: progressNote.type,
      method: progressNote.noteText,
      Prescriber: progressNote.username
    }));
    const csvString = this.convertToCSV(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'progressNotes.csv');
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