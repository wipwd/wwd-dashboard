import { Component, Input, OnInit } from '@angular/core';
import { TaskItem, TaskPriorityEnum, TasksBucketBaseService } from '../tasks/tasks.service';

@Component({
  selector: 'app-tasks-organizer',
  templateUrl: './tasks-organizer.component.html',
  styleUrls: ['./tasks-organizer.component.scss']
})
export class TasksOrganizerComponent implements OnInit {

  @Input() bucket_from: TasksBucketBaseService;
  @Input() bucket_next: TasksBucketBaseService;

  private _num_urgent: number = 0;
  private _num_normal: number = 0;
  private _num_other: number = 0;

  private _is_expanded_urgent: boolean = false;
  private _is_expanded_normal: boolean = false;
  private _is_expanded_other: boolean = false;

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
    if (!this.bucket_from) {
      return;
    }
    this.bucket_from.getTasksObserver().subscribe({
      next: (tasks: TaskItem[]) => {
        this._num_urgent = 0;
        this._num_normal = 0;
        this._num_other = 0;
        this._handleTasks(tasks);
      }
    });
  }

  public getBucketFrom(): TasksBucketBaseService {
    return this.bucket_from;
  }

  public getBucketNext(): TasksBucketBaseService {
    return this.bucket_next;
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

  public isUrgentExpanded(): boolean {
    return this._is_expanded_urgent && this.hasUrgentTasks();
  }

  public isNormalExpanded(): boolean {
    return this._is_expanded_normal && this.hasNormalTasks();
  }

  public isOtherExpanded(): boolean {
    return this._is_expanded_other && this.hasOtherTasks();
  }

  public toggleUrgent(): void {
    this._is_expanded_urgent = !this._is_expanded_urgent;
  }

  public toggleNormal(): void {
    this._is_expanded_normal = !this._is_expanded_normal;
  }

  public toggleOther(): void {
    this._is_expanded_other = !this._is_expanded_other;
  }
}
