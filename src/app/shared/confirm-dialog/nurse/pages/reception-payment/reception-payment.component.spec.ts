import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionPaymentComponent } from './reception-payment.component';

describe('ReceptionPaymentComponent', () => {
  let component: ReceptionPaymentComponent;
  let fixture: ComponentFixture<ReceptionPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceptionPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
