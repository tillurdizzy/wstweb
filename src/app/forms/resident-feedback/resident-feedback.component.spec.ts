import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentFeedbackComponent } from './resident-feedback.component';

describe('ResidentFeedbackComponent', () => {
  let component: ResidentFeedbackComponent;
  let fixture: ComponentFixture<ResidentFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
