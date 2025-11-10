import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionCreateDialogComponent } from './prescription-create-dialog.component';

describe('PrescriptionCreateDialogComponent', () => {
  let component: PrescriptionCreateDialogComponent;
  let fixture: ComponentFixture<PrescriptionCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescriptionCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
