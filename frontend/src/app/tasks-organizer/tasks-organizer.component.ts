import { Component, Input, OnInit } from '@angular/core';
import { TasksBucketBacklogService } from '../tasks/tasks-bucket-backlog.service';
import { TaskItem, TaskPriorityEnum, TasksBucketBaseService, TasksService } from '../tasks/tasks.service';

@Component({
  selector: 'app-tasks-organizer',
  templateUrl: './tasks-organizer.component.html',
  styleUrls: ['./tasks-organizer.component.scss']
})
export class TasksOrganizerComponent implements OnInit {

  @Input() bucketsvc: TasksBucketBaseService;

  private _num_urgent: number = 0;
  private _num_normal: number = 0;
  private _num_other: number = 0;

  constructor() { }

  private _handleTasks(tasks: TaskItem[]): void {
    tasks.forEach( (task: TaskItem) => {
      switch (task.priority) {
        case TaskPriorityEnum.high: this._num_urgent ++; break;
        case TaskPriorityEnum.medium: this._num_normal ++; break;
        default: this._num_other ++;
      }
    });
  }

  public ngOnInit(): void {
    if (!this.bucketsvc) {
      return;
    }
    this.bucketsvc.getTasksObserver().subscribe({
      next: (tasks: TaskItem[]) => {
        this._num_urgent = 0;
        this._num_normal = 0;
        this._num_other = 0;
        this._handleTasks(tasks);
      }
    });
  }

  public getBucketService(): TasksBucketBaseService {
    return this.bucketsvc;
  }

  public getNumUrgentTasks(): number {
    return this._num_urgent;
  }

  public getNumNormalTasks(): number {
    return this._num_normal;
  }

  public getNumOtherTasks(): number {
    return this._num_other;
  }

  public hasUrgentTasks(): boolean {
    return this.getNumUrgentTasks() > 0;
  }

  public hasNormalTasks(): boolean {
    return this.getNumNormalTasks() > 0;
  }

  public hasOtherTasks(): boolean {
    return this.getNumOtherTasks() > 0;
  }

  public getUrgentPrio(): TaskPriorityEnum[] {
    return [TaskPriorityEnum.high];
  }

  public getNormalPrio(): TaskPriorityEnum[] {
    return [TaskPriorityEnum.medium];
  }

  public getOtherPrio(): TaskPriorityEnum[] {
    return [TaskPriorityEnum.none, TaskPriorityEnum.low];
  }
}
