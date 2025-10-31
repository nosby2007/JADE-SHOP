import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderRxDialogComponent } from './order-rx-dialog.component';

describe('OrderRxDialogComponent', () => {
  let component: OrderRxDialogComponent;
  let fixture: ComponentFixture<OrderRxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderRxDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderRxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
