import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TaskItem,
  TasksBucketBaseService,
  TasksService
} from './tasks.service';

@Injectable({
  providedIn: 'root'
})
export class TasksBucketDoneService extends TasksBucketBaseService {

  public constructor(private _tasks_svc: TasksService) {
    super(_tasks_svc);
  }

  protected _tasksUpdated(): void { }

  protected _obtainTaskSubject(): BehaviorSubject<TaskItem[]> {
    return this._svc.getDone();
  }
}
