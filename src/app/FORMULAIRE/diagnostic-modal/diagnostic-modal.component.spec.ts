import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticModalComponent } from './diagnostic-modal.component';

describe('DiagnosticModalComponent', () => {
  let component: DiagnosticModalComponent;
  let fixture: ComponentFixture<DiagnosticModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosticModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
