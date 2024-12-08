import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailNurseComponent } from './detail-nurse.component';

describe('DetailNurseComponent', () => {
  let component: DetailNurseComponent;
  let fixture: ComponentFixture<DetailNurseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailNurseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailNurseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
