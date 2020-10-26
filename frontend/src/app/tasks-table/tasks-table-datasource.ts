import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';
import { TasksService, TaskItem, TasksBucketBaseService, TaskPriorityEnum } from '../tasks/tasks.service';

// TODO: Replace this with your own data model type
export interface TasksTableItem {
  name: string;
  id: number;
}

// TODO: replace this with real data from your application
const EXAMPLE_DATA: TasksTableItem[] = [
  {id: 1, name: 'Hydrogen'},
  {id: 2, name: 'Helium'},
  {id: 3, name: 'Lithium'},
  {id: 4, name: 'Beryllium'},
  {id: 5, name: 'Boron'},
  {id: 6, name: 'Carbon'},
  {id: 7, name: 'Nitrogen'},
  {id: 8, name: 'Oxygen'},
  {id: 9, name: 'Fluorine'},
  {id: 10, name: 'Neon'},
  {id: 11, name: 'Sodium'},
  {id: 12, name: 'Magnesium'},
  {id: 13, name: 'Aluminum'},
  {id: 14, name: 'Silicon'},
  {id: 15, name: 'Phosphorus'},
  {id: 16, name: 'Sulfur'},
  {id: 17, name: 'Chlorine'},
  {id: 18, name: 'Argon'},
  {id: 19, name: 'Potassium'},
  {id: 20, name: 'Calcium'},
];

/**
 * Data source for the TasksTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class TasksTableDataSource extends DataSource<TaskItem> {

  private _subject_tasks: BehaviorSubject<TaskItem[]> =
    new BehaviorSubject<TaskItem[]>([]);

  public tasks: TaskItem[] = [];
  public paginator: MatPaginator;
  public sort: MatSort;

  constructor(
    private _bucket_svc: TasksBucketBaseService,
    private _priority?: TaskPriorityEnum[]
  ) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  public connect(): Observable<TaskItem[]> {
    this._bucket_svc.getTasksObserver().subscribe({
      next: (_tasks: TaskItem[]) => {
        this._handleTasks(_tasks);
      }
    });
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      this._subject_tasks,
      this.paginator.page,
      this.sort.sortChange
    ];

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.tasks]));
    }));
  }

  /**
   * Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during
   * connect.
   */
  public disconnect(): void {}

  private _handleTasks(tasks: TaskItem[]): void {
    const has_priorities: boolean =
      (!!this._priority && this._priority.length > 0);

    const new_tasks: TaskItem[] = [];
    tasks.forEach( (task: TaskItem) => {
      if (has_priorities && !this._wantsPriority(task.priority)) {
        return;
      }
      new_tasks.push(task);
    });
    this.tasks = new_tasks;
    this._subject_tasks.next(new_tasks);
  }

  private _wantsPriority(prio: TaskPriorityEnum): boolean {
    // if no priority is defined, we want everything.
    if (!this._priority) {
      return true;
    }
    let wants: boolean = false;
    this._priority.forEach( (wanted: TaskPriorityEnum) => {
      if (wanted === prio) {
        wants = true;
      }
    });
    return wants;
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: TaskItem[]): TaskItem[] {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: TaskItem[]): TaskItem[] {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        // case 'name': return compare(a.name, b.name, isAsc);
        // case 'id': return compare(+a.id, +b.id, isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting
 */
function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
