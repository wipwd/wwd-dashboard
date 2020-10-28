import { TestBed } from '@angular/core/testing';

import { TasksBucketBacklogService } from './tasks-bucket-backlog.service';

describe('TasksBucketBacklogService', () => {
  let service: TasksBucketBacklogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksBucketBacklogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
