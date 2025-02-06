import { TestBed } from '@angular/core/testing';

import { NgxGrowthbookService } from './ngx-growthbook.service';

describe('NgxGrowthbookService', () => {
  let service: NgxGrowthbookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxGrowthbookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
