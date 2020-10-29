import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskItem } from '../tasks/types';
import { GithubService } from './github/github.service';
import {
  IntegrationService,
  IntegrationTaskItem,
  IntegrationTasks
} from './types';

@Injectable({
  providedIn: 'root'
})
export class IntegrationManagerService {

  private _integrations: {[id: string]: IntegrationService} = {};
  private _updated_tasks_subject: BehaviorSubject<TaskItem[]> =
    new BehaviorSubject<TaskItem[]>([]);
  private _tasks_by_uuid: {[id: string]: IntegrationTaskItem} = {};
  private _task_uuid_by_service: {[id: string]: IntegrationService} = {};
  private _tasks_by_service: {[id: string]: IntegrationTaskItem[]} = {};
  private _tasks: TaskItem[] = [];


  constructor(
    private _github_svc: GithubService
  ) {
    this._initService(_github_svc);
  }

  private _initService(svc: IntegrationService): void {
    const svc_name: string = svc.name;
    if (svc_name in this._integrations) {
      console.debug(`integration ${svc_name} already managed`);
      return;
    }

    this._integrations[svc_name] = svc;
    this._tasks_by_service[svc_name] = [];
    svc.getTasks().subscribe(this._updateTasks.bind(this));
  }

  private _updateTasks(svc_tasks: IntegrationTasks): void {
    if (!svc_tasks) {
      return;
    }
    this._updateTaskForService(svc_tasks);
    this._tasks = [];
    Object.values(this._tasks_by_uuid).forEach( (item: IntegrationTaskItem) => {
      this._tasks.push(item.task_item);
    });
    this._updated_tasks_subject.next(this._tasks);
    console.debug("update tasks from integration mgr: ", this._tasks);
  }

  private _updateTaskForService(svc_tasks: IntegrationTasks): void {
    const svc_name: string = svc_tasks.service.name;
    if (!(svc_name in this._integrations)) {
      console.error(`unknown service integration ${svc_name}`);
      return;
    }
    const tasks_to_remove: IntegrationTaskItem[] = [];
    const cur_svc_tasks: IntegrationTaskItem[] =
      this._tasks_by_service[svc_name];
    const task_items: IntegrationTaskItem[] = svc_tasks.tasks;
    const task_uuids: {[id: string]: IntegrationService} = {};

    task_items.forEach( (item: IntegrationTaskItem) => {
      task_uuids[item.uuid] = item.service;
    });
    cur_svc_tasks.forEach( (item: IntegrationTaskItem) => {
      if (!(item.uuid in task_uuids)) {
        tasks_to_remove.push(item);
      }
    });

    tasks_to_remove.forEach( (item: IntegrationTaskItem) => {
      delete this._tasks_by_uuid[item.uuid];
      delete this._task_uuid_by_service[item.uuid];
    });

    task_items.forEach( (item: IntegrationTaskItem) => {
      this._tasks_by_uuid[item.uuid] = item;
      this._task_uuid_by_service[item.uuid] = item.service;
    });
    this._tasks_by_service[svc_name] = svc_tasks.tasks;
  }

  public getTasks(): BehaviorSubject<TaskItem[]> {
    return this._updated_tasks_subject;
  }
}
