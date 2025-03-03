import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteesHomeComponent } from './committees-home.component';

describe('CommitteesHomeComponent', () => {
  let component: CommitteesHomeComponent;
  let fixture: ComponentFixture<CommitteesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommitteesHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommitteesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
