import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPrescriptionDialogComponent } from './add-prescription-dialog.component';

describe('AddPrescriptionDialogComponent', () => {
  let component: AddPrescriptionDialogComponent;
  let fixture: ComponentFixture<AddPrescriptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPrescriptionDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPrescriptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
