import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryRxDialogComponent } from './laboratory-rx-dialog.component';

describe('LaboratoryRxDialogComponent', () => {
  let component: LaboratoryRxDialogComponent;
  let fixture: ComponentFixture<LaboratoryRxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaboratoryRxDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryRxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
