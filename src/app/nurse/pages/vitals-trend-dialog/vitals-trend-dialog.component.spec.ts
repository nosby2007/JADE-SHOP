import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalsTrendDialogComponent } from './vitals-trend-dialog.component';

describe('VitalsTrendDialogComponent', () => {
  let component: VitalsTrendDialogComponent;
  let fixture: ComponentFixture<VitalsTrendDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VitalsTrendDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitalsTrendDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
