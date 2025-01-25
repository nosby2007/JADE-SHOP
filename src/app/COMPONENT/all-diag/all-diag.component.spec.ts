import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDiagComponent } from './all-diag.component';

describe('AllDiagComponent', () => {
  let component: AllDiagComponent;
  let fixture: ComponentFixture<AllDiagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllDiagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllDiagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
