import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/core/api.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({ selector:'app-wound-detail', templateUrl:'./wound-detail.component.html' })
export class WoundDetailComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  id = this.route.snapshot.paramMap.get('id')!;
  assessments:any[]=[];

  assess = new FormGroup({
    date: new FormControl(new Date().toISOString().slice(0,10)),
    lengthCm: new FormControl(0),
    widthCm: new FormControl(0),
    depthCm: new FormControl<number|null>(null),
    exudate: new FormControl<'none'|'scant'|'light'|'moderate'|'heavy'>('light'),
    painScore: new FormControl(0)
  });

  ngOnInit(){ this.load(); }
  load(){ this.api.listAssessments(this.id).subscribe((r:any)=> this.assessments = r); }
  saveAssessment(){
    const body:any = {
      date: this.assess.value.date,
      size: { lengthCm: Number(this.assess.value.lengthCm), widthCm: Number(this.assess.value.widthCm) }
    };
    if (this.assess.value.depthCm != null) body.size.depthCm = Number(this.assess.value.depthCm);
    body.exudate = this.assess.value.exudate;
    body.painScore = Number(this.assess.value.painScore);
    this.api.createAssessment(this.id, body).subscribe(()=> this.load());
  }

  async fileSelected(evt:any){
    const f: File = evt.target.files?.[0];
    if (!f) return;
    const up:any = await this.api.requestUploadUrl(f.type, f.name, { woundId: this.id }).toPromise();
    await fetch(up.uploadUrl, { method:'PUT', headers:{ 'Content-Type': f.type }, body: f });
    await this.api.saveMediaMeta({ path: up.path, contentType: f.type, tags:['wound'], ref:{ woundId: this.id } }).toPromise();
    alert('Photo envoyée');
  }
}
