import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="stats-container">
      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <mat-icon>assignment</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ totalTasks }}</h3>
            <p>Total de Tareas</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon completed">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ completedTasks }}</h3>
            <p>Completadas</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ pendingTasks }}</h3>
            <p>Pendientes</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card progress-card">
        <div class="stat-content">
          <div class="progress-info">
            <h4>Progreso</h4>
            <span class="progress-percentage">{{ completionPercentage }}%</span>
          </div>
          <mat-progress-bar 
            mode="determinate" 
            [value]="completionPercentage"
            color="primary">
          </mat-progress-bar>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 16px;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.completed {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      }

      &.pending {
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .stat-info {
      flex: 1;

      h3 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 4px 0 0 0;
        font-size: 14px;
        color: #666;
      }
    }

    .progress-card {
      .stat-content {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .progress-percentage {
          font-size: 18px;
          font-weight: 600;
          color: #3f51b5;
        }
      }
    }

    @media (max-width: 768px) {
      .stats-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .stats-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TaskStatsComponent {
  @Input() tasks: Task[] = [];

  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  get pendingTasks(): number {
    return this.tasks.filter(task => !task.completed).length;
  }

  get completionPercentage(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.completedTasks / this.totalTasks) * 100);
  }
}