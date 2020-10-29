import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { TasksBucketDoneService } from '../tasks/tasks-bucket-done.service';
import { TasksBucketBaseService, TasksService } from '../tasks/tasks.service';
import { TaskItem, TaskPriorityEnum } from '../tasks/types';
import { TasksTableDataSource } from './tasks-table-datasource';

@Component({
  selector: 'app-tasks-table',
  templateUrl: './tasks-table.component.html',
  styleUrls: ['./tasks-table.component.scss']
})
export class TasksTableComponent implements AfterViewInit, OnInit {

  @Input() bucket_from: TasksBucketBaseService;
  @Input() bucket_next: TasksBucketBaseService;
  @Input() priority: TaskPriorityEnum[];
  @Input() num_items: number = 50;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<TaskItem>;
  public dataSource: TasksTableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or
   * reordered.
   */
  displayedColumns = ["priority", "title", "updated_at", "actions"];

  constructor(
    private _tasks_svc: TasksService,
    private _bucket_done: TasksBucketDoneService
  ) { }

  ngOnInit(): void {

    if (!this.bucket_from) {
      console.error("bucket not specified for table data source");
      return;
    }

    this.dataSource = new TasksTableDataSource(this.bucket_from, this.priority);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  public onMoveNext(task: TaskItem): void {
    if (!this.bucket_next) {
      console.error("can't move task; no next bucket.");
      return;
    }
    console.log("move task to next bucket: ", task);
    this._tasks_svc.move(task, this.bucket_from, this.bucket_next);
  }

  public hasNext(): boolean {
    return !!this.bucket_next;
  }

  public ignoreTask(task: TaskItem): void {
    console.log("ignore task ", task);
    this._tasks_svc.drop(this.bucket_from, task);
  }

  public markDone(task: TaskItem): void {
    console.log("mark task done ", task);
    if (this.bucket_from === this._bucket_done) {
      console.log("task already done");
      return;
    }
    this._tasks_svc.move(task, this.bucket_from, this._bucket_done);
  }
}
