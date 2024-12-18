import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  printContent(printAreaId: string) {
    const printArea = document.getElementById(printAreaId)?.innerHTML;

    if (!printArea) {
      console.error('Zone d’impression introuvable.');
      return;
    }

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printArea; // Remplace le contenu par la zone d’impression
    window.print();
    document.body.innerHTML = originalContents; // Restaure le contenu original
  }

  printInNewWindow(printAreaId: string) {
    const printArea = document.getElementById(printAreaId)?.innerHTML;

    if (!printArea) {
      console.error('Zone d’impression introuvable.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Échec de l’ouverture de la fenêtre d’impression.');
      return;
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>Impression</title>
        <style>
          /* Ajoutez vos styles ici */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          th {
            background-color: #f4f4f4;
          }
        </style>
      </head>
      <body>${printArea}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }
}