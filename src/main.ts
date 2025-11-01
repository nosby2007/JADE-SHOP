import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
 declare const pdfMake: any;
pdfMake.createPdf({ content: ['Hello'] }).open();


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
