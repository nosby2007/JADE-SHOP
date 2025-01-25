import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPresComponent } from './all-pres.component';

describe('AllPresComponent', () => {
  let component: AllPresComponent;
  let fixture: ComponentFixture<AllPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllPresComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
