import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { TaskItem, TaskPriorityEnum, TasksBucketBaseService, TasksService } from '../tasks/tasks.service';
import { TasksTableDataSource } from './tasks-table-datasource';

@Component({
  selector: 'app-tasks-table',
  templateUrl: './tasks-table.component.html',
  styleUrls: ['./tasks-table.component.scss']
})
export class TasksTableComponent implements AfterViewInit, OnInit {

  @Input() bucketsvc: TasksBucketBaseService;
  @Input() priority: TaskPriorityEnum[];
  @Input() num_items: number = 50;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<TaskItem>;
  public dataSource: TasksTableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or
   * reordered.
   */
  displayedColumns = ['priority', 'title', 'updated_at'];

  constructor(private _tasks_svc: TasksService) { }

  ngOnInit(): void {

    if (!this.bucketsvc) {
      console.error("bucket not specified for table data source");
      return;
    }

    this.dataSource = new TasksTableDataSource(this.bucketsvc, this.priority);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
