import { BehaviorSubject } from 'rxjs';
import { TaskItem } from '../tasks/types';


export interface IntegrationServiceConfigField {
  name: string;  // field name
  type: string;  // field type
  value: any;    // field value
}

export interface IntegrationServiceConfig {
  name: string;  // service name
  config?: IntegrationServiceConfigField[];  // fields
}

export interface IntegrationTaskItem {
  uuid: string;
  service: IntegrationService;
  task_item: TaskItem;
}

export interface IntegrationTasks {
  service: IntegrationService;
  tasks: IntegrationTaskItem[];
}

export abstract class IntegrationService {

  private _task_update_subject: BehaviorSubject<IntegrationTasks> =
    new BehaviorSubject<IntegrationTasks>(null);


  protected _updateTasks(tasks_items: TaskItem[]): void {
    const svc_tasks: IntegrationTaskItem[] = [];
    tasks_items.forEach( (task: TaskItem) => {
      svc_tasks.push({
        uuid: task.uuid,
        service: this,
        task_item: task
      });
    });
    this._task_update_subject.next({
      service: this,
      tasks: svc_tasks
    });
  }

  public get name(): string {
    return this._getName();
  }

  public getTasks(): BehaviorSubject<IntegrationTasks> {
    return this._task_update_subject;
  }

  protected abstract _getName(): string;

  public abstract remove(task_uuid: string): void;
  public abstract drop(task_uuid: string): void;
  public abstract done(task_uuid: string): void;
  public abstract read(task_uuid: string): void;
  public abstract getConfig(): IntegrationServiceConfig;
}
