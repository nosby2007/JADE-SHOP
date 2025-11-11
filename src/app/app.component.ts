import { Component } from '@angular/core';
import { InactivityService } from './service/inactivity.service';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

   constructor(private _inactivity: InactivityService) {}
 }