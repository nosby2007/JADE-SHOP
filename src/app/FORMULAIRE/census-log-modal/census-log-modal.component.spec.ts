import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusLogModalComponent } from './census-log-modal.component';

describe('CensusLogModalComponent', () => {
  let component: CensusLogModalComponent;
  let fixture: ComponentFixture<CensusLogModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CensusLogModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CensusLogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
