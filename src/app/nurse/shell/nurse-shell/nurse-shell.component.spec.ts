import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseShellComponent } from './nurse-shell.component';

describe('NurseShellComponent', () => {
  let component: NurseShellComponent;
  let fixture: ComponentFixture<NurseShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NurseShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NurseShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
