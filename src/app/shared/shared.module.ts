import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePreviewPipe } from '../file-preview.pipe';


@NgModule({
  declarations: [FilePreviewPipe],
  imports: [CommonModule],
  exports: [FilePreviewPipe]   // ⬅️ on exporte pour l’utiliser dans d’autres modules
})
export class SharedModule {}
