import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdsShellComponent } from './mds-shell.component';

describe('MdsShellComponent', () => {
  let component: MdsShellComponent;
  let fixture: ComponentFixture<MdsShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MdsShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MdsShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
