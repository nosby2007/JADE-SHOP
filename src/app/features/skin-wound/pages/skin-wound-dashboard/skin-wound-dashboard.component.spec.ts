import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkinWoundDashboardComponent } from './skin-wound-dashboard.component';

describe('SkinWoundDashboardComponent', () => {
  let component: SkinWoundDashboardComponent;
  let fixture: ComponentFixture<SkinWoundDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkinWoundDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkinWoundDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
