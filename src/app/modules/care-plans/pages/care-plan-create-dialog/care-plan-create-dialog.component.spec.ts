import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarePlanCreateDialogComponent } from './care-plan-create-dialog.component';

describe('CarePlanCreateDialogComponent', () => {
  let component: CarePlanCreateDialogComponent;
  let fixture: ComponentFixture<CarePlanCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarePlanCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarePlanCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
