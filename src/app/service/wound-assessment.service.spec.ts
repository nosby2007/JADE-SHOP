import { TestBed } from '@angular/core/testing';

import { WoundAssessmentService } from './wound-assessment.service';

describe('WoundAssessmentService', () => {
  let service: WoundAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WoundAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
