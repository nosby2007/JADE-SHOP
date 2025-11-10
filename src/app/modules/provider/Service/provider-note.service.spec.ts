import { TestBed } from '@angular/core/testing';

import { ProviderNoteService } from './provider-note.service';

describe('ProviderNoteService', () => {
  let service: ProviderNoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProviderNoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
