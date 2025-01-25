import { Component, OnInit } from '@angular/core';
import { StatisticService } from 'src/app/SERVICE/statistic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  totalPatients: number = 0;
  totalActivePrescriptions: number | null = null;
  totalCompletedPrescriptions: number = 0;
  patientsUnderAntibiotic: number | null = null;


  constructor(private statisticsService: StatisticService) {}

  ngOnInit(): void {
    this.statisticsService.getTotalPatients().subscribe(count => {
      this.totalPatients = count;
    });

      // Récupérer les prescriptions actives
      this.statisticsService.getActivePrescriptions().subscribe(
        total => {
          this.totalActivePrescriptions = total;
          console.log('Nombre de prescriptions actives :', total);
        },
        error => {
          console.error('Erreur lors de la récupération des prescriptions actives :', error);
        }
      );
  
      // Compter les prescriptions terminées
      this.statisticsService.getCompletedPrescriptions().subscribe(
        total => {
          this.totalCompletedPrescriptions = total;
          console.log('Nombre de prescriptions terminées :', total);
        },
        error => {
          console.error('Erreur lors de la récupération des prescriptions terminées :', error);
        }
      );

      this.statisticsService.getPatientsUnderAntibiotic().subscribe(
        total => {
          this.patientsUnderAntibiotic = total;
          console.log('Nombre de patients sous antibiotiques:', total);
        },
        error => {
          console.error('Erreur lors de la récupération des patients sous antibiotiques :', error);
        }
      );
    }
  }