import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarePlanListComponent } from './care-plan-list.component';

describe('CarePlanListComponent', () => {
  let component: CarePlanListComponent;
  let fixture: ComponentFixture<CarePlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarePlanListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarePlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
