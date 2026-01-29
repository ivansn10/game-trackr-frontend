import { TestBed } from '@angular/core/testing';

import { SyncServiceService } from './sync-service.service';

describe('SyncServiceService', () => {
  let service: SyncServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyncServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
