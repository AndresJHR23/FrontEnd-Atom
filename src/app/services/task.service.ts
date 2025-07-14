import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public tasks$ = this.tasksSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {}

  getTasksByUser(userId: string): Observable<Task[]> {
    this.loadingSubject.next(true);
    return this.apiService.get<Task[]>(`/tasks/user/${userId}`)
      .pipe(
        map(response => this.parseTaskDates(response.data || [])),
        tap(tasks => {
          this.tasksSubject.next(tasks);
          this.loadingSubject.next(false);
        })
      );
  }

  createTask(taskData: CreateTaskRequest): Observable<Task> {
    return this.apiService.post<Task>('/tasks', taskData)
      .pipe(
        map(response => this.parseTaskDates([response.data!])[0]),
        tap(newTask => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([newTask, ...currentTasks]);
        })
      );
  }

  updateTask(id: string, updateData: UpdateTaskRequest): Observable<Task> {
    return this.apiService.put<Task>(`/tasks/${id}`, updateData)
      .pipe(
        map(response => this.parseTaskDates([response.data!])[0]),
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.map(task => 
            task.id === id ? updatedTask : task
          );
          this.tasksSubject.next(updatedTasks);
        })
      );
  }

  deleteTask(id: string): Observable<void> {
    return this.apiService.delete(`/tasks/${id}`)
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const filteredTasks = currentTasks.filter(task => task.id !== id);
          this.tasksSubject.next(filteredTasks);
        }),
        map(() => void 0)
      );
  }

  toggleTaskCompletion(task: Task): Observable<Task> {
    return this.updateTask(task.id, { completed: !task.completed });
  }

  private parseTaskDates(tasks: any[]): Task[] {
    return tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  }
}