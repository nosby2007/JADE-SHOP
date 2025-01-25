import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-count-down-modal',
  templateUrl: './count-down-modal.component.html',
  styleUrls: ['./count-down-modal.component.scss']
})
export class CountDownModalComponent  {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { countdown: number },
    private dialogRef: MatDialogRef<CountDownModalComponent>
  ) {}

  stayLoggedIn(): void {
    this.dialogRef.close(true);
  }

  logout(): void {
    this.dialogRef.close(false);
  }
}