import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportGenerateDialogComponent } from './report-generate-dialog.component';

describe('ReportGenerateDialogComponent', () => {
  let component: ReportGenerateDialogComponent;
  let fixture: ComponentFixture<ReportGenerateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportGenerateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportGenerateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
