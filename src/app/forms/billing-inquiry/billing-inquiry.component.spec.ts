import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingInquiryComponent } from './billing-inquiry.component';

describe('BillingInquiryComponent', () => {
  let component: BillingInquiryComponent;
  let fixture: ComponentFixture<BillingInquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingInquiryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
