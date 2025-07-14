import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../services/user.service';
import { TaskService } from '../../services/task.service';
import { ExportService } from '../../services/export.service';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { TaskStatsComponent } from '../task-stats/task-stats.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TaskStatsComponent
  ],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  searchTerm: string = '';
  filterStatus: 'all' | 'completed' | 'pending' = 'all';
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private taskService: TaskService,
    private exportService: ExportService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscribeToUser();
    this.subscribeToTasks();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToUser(): void {
    this.userService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.currentUser = authState.user;
        if (this.currentUser) {
          this.loadTasks();
        }
      });
  }

  private subscribeToTasks(): void {
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;
        this.applyFilters();
      });
  }

  private subscribeToLoading(): void {
    this.taskService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
  }

  private loadTasks(): void {
    if (this.currentUser) {
      this.taskService.getTasksByUser(this.currentUser.id).subscribe({
        error: (error) => {
          this.showMessage('Error al cargar las tareas');
          console.error('Error loading tasks:', error);
        }
      });
    }
  }

  onCreateTask(): void {
    console.log('onCreateTask called'); // Debug log
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.currentUser) {
        const taskData = {
          ...result,
          userId: this.currentUser.id
        };

        this.taskService.createTask(taskData).subscribe({
          next: () => {
            this.showMessage('Tarea creada exitosamente');
          },
          error: (error) => {
            this.showMessage('Error al crear la tarea');
            console.error('Error creating task:', error);
          }
        });
      }
    });
  }

  onEditTask(task: Task): void {
    console.log('onEditTask called for task:', task.title); // Debug log
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { mode: 'edit', task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.updateTask(task.id, result).subscribe({
          next: () => {
            this.showMessage('Tarea actualizada exitosamente');
          },
          error: (error) => {
            this.showMessage('Error al actualizar la tarea');
            console.error('Error updating task:', error);
          }
        });
      }
    });
  }

  onDeleteTask(task: Task): void {
    console.log('onDeleteTask called for task:', task.title); // Debug log
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar tarea',
        message: `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.showMessage('Tarea eliminada exitosamente');
          },
          error: (error) => {
            this.showMessage('Error al eliminar la tarea');
            console.error('Error deleting task:', error);
          }
        });
      }
    });
  }

  onToggleTask(task: Task): void {
    this.taskService.toggleTaskCompletion(task).subscribe({
      next: () => {
        const status = task.completed ? 'pendiente' : 'completada';
        this.showMessage(`Tarea marcada como ${status}`);
      },
      error: (error) => {
        this.showMessage('Error al actualizar la tarea');
        console.error('Error toggling task:', error);
      }
    });
  }

  onLogout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
    this.showMessage('Sesión cerrada exitosamente');
  }

  onExportToExcel(): void {
    if (this.tasks.length === 0) {
      this.showMessage('No hay tareas para exportar');
      return;
    }
    this.exportService.exportToExcel(this.tasks);
    this.showMessage('Tareas exportadas a Excel');
  }

  onExportToCSV(): void {
    if (this.tasks.length === 0) {
      this.showMessage('No hay tareas para exportar');
      return;
    }
    this.exportService.exportToCSV(this.tasks);
    this.showMessage('Tareas exportadas a CSV');
  }

  onExportCompleted(): void {
    const completedTasks = this.tasks.filter(task => task.completed);
    if (completedTasks.length === 0) {
      this.showMessage('No hay tareas completadas para exportar');
      return;
    }
    this.exportService.exportCompletedTasks(this.tasks);
    this.showMessage('Tareas completadas exportadas');
  }

  onExportPending(): void {
    const pendingTasks = this.tasks.filter(task => !task.completed);
    if (pendingTasks.length === 0) {
      this.showMessage('No hay tareas pendientes para exportar');
      return;
    }
    this.exportService.exportPendingTasks(this.tasks);
    this.showMessage('Tareas pendientes exportadas');
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onFilterChange(status: 'all' | 'completed' | 'pending'): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.tasks];

    // Filtrar por búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (this.filterStatus === 'completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (this.filterStatus === 'pending') {
      filtered = filtered.filter(task => !task.completed);
    }

    this.filteredTasks = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.applyFilters();
  }
}