import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksOrganizerComponent } from './tasks-organizer.component';

describe('TasksOrganizerComponent', () => {
  let component: TasksOrganizerComponent;
  let fixture: ComponentFixture<TasksOrganizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksOrganizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksOrganizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
