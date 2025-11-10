import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionShellComponent } from './reception-shell.component';

describe('ReceptionShellComponent', () => {
  let component: ReceptionShellComponent;
  let fixture: ComponentFixture<ReceptionShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceptionShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
