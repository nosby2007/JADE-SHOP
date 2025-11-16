import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentEditDialogComponent } from './payment-edit-dialog.component';

describe('PaymentEditDialogComponent', () => {
  let component: PaymentEditDialogComponent;
  let fixture: ComponentFixture<PaymentEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentEditDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
