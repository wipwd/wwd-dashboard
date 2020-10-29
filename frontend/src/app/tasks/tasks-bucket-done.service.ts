import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TasksBucketBaseService,
  TasksService
} from './tasks.service';
import { TaskItem } from './types';

@Injectable({
  providedIn: 'root'
})
export class TasksBucketDoneService extends TasksBucketBaseService {

  public constructor(private _tasks_svc: TasksService) {
    super(_tasks_svc, "done");
  }

  protected _tasksUpdated(): void { }

  protected _obtainTaskSubject(): BehaviorSubject<TaskItem[]> {
    return this._svc.getBucket("done");
  }
}
