import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatienDetailsComponent } from './patien-details.component';

describe('PatienDetailsComponent', () => {
  let component: PatienDetailsComponent;
  let fixture: ComponentFixture<PatienDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatienDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatienDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
