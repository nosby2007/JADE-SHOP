import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoundDetailComponent } from './wound-detail.component';

describe('WoundDetailComponent', () => {
  let component: WoundDetailComponent;
  let fixture: ComponentFixture<WoundDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoundDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WoundDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
