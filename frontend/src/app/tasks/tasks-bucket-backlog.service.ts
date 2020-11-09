import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TasksService,
  TasksBucketBaseService
} from './tasks.service';
import { TaskItem } from './types';


@Injectable({
  providedIn: 'root'
})
export class TasksBucketBacklogService extends TasksBucketBaseService {

  public constructor(private _tasks_svc: TasksService) {
    super(_tasks_svc, "backlog");
  }

  protected _tasksUpdated(): void { }
  protected _obtainTaskSubject(): BehaviorSubject<TaskItem[]> {
    return this._svc.getBucket("backlog");
  }
}
