import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarePlanShellComponent } from './care-plan-shell.component';

describe('CarePlanShellComponent', () => {
  let component: CarePlanShellComponent;
  let fixture: ComponentFixture<CarePlanShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarePlanShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarePlanShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
