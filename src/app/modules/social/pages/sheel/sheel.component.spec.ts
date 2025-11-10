import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheelComponent } from './sheel.component';

describe('SheelComponent', () => {
  let component: SheelComponent;
  let fixture: ComponentFixture<SheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SheelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
