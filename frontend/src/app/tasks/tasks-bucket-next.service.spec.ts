import { TestBed } from '@angular/core/testing';

import { TasksBucketNextService } from './tasks-bucket-next.service';

describe('TasksBucketNextService', () => {
  let service: TasksBucketNextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksBucketNextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
