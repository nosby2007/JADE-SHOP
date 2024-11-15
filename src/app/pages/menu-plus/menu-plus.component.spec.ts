import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPlusComponent } from './menu-plus.component';

describe('MenuPlusComponent', () => {
  let component: MenuPlusComponent;
  let fixture: ComponentFixture<MenuPlusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuPlusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuPlusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
