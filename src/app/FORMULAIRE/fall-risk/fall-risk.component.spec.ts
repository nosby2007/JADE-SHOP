import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FallRiskComponent } from './fall-risk.component';

describe('FallRiskComponent', () => {
  let component: FallRiskComponent;
  let fixture: ComponentFixture<FallRiskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FallRiskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FallRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
