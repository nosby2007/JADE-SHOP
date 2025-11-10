import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdsListComponent } from './mds-list.component';

describe('MdsListComponent', () => {
  let component: MdsListComponent;
  let fixture: ComponentFixture<MdsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MdsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MdsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
