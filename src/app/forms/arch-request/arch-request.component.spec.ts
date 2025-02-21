import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchRequestComponent } from './arch-request.component';

describe('ArchRequestComponent', () => {
  let component: ArchRequestComponent;
  let fixture: ComponentFixture<ArchRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
