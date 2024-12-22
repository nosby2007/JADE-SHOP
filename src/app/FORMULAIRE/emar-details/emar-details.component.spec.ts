import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmarDetailsComponent } from './emar-details.component';

describe('EmarDetailsComponent', () => {
  let component: EmarDetailsComponent;
  let fixture: ComponentFixture<EmarDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmarDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmarDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
