import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitSearchComponent } from './unit-search.component';

describe('UnitSearchComponent', () => {
  let component: UnitSearchComponent;
  let fixture: ComponentFixture<UnitSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
