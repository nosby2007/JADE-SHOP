import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseTasksComponent } from './nurse-tasks.component';

describe('NurseTasksComponent', () => {
  let component: NurseTasksComponent;
  let fixture: ComponentFixture<NurseTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NurseTasksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NurseTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
