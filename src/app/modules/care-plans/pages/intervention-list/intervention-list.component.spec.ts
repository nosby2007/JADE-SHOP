import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionListComponent } from './intervention-list.component';

describe('InterventionListComponent', () => {
  let component: InterventionListComponent;
  let fixture: ComponentFixture<InterventionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterventionListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
