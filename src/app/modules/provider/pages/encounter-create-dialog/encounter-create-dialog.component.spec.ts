import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterCreateDialogComponent } from './encounter-create-dialog.component';

describe('EncounterCreateDialogComponent', () => {
  let component: EncounterCreateDialogComponent;
  let fixture: ComponentFixture<EncounterCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncounterCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncounterCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
