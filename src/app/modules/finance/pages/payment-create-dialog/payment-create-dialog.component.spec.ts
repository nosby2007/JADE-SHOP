import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCreateDialogComponent } from './payment-create-dialog.component';

describe('PaymentCreateDialogComponent', () => {
  let component: PaymentCreateDialogComponent;
  let fixture: ComponentFixture<PaymentCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
