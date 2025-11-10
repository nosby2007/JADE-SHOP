import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskShellComponent } from './task-shell.component';

describe('TaskShellComponent', () => {
  let component: TaskShellComponent;
  let fixture: ComponentFixture<TaskShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
