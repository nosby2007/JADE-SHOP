import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabOrderDialogComponent } from './lab-order-dialog.component';

describe('LabOrderDialogComponent', () => {
  let component: LabOrderDialogComponent;
  let fixture: ComponentFixture<LabOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabOrderDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
