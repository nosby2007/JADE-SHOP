import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagingListComponent } from './imaging-list.component';

describe('ImagingListComponent', () => {
  let component: ImagingListComponent;
  let fixture: ComponentFixture<ImagingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagingListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
