import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseLabListComponent } from './nurse-lab-list.component';

describe('NurseLabListComponent', () => {
  let component: NurseLabListComponent;
  let fixture: ComponentFixture<NurseLabListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NurseLabListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NurseLabListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
