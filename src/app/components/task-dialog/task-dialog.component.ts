import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../models/task.model';

export interface TaskDialogData {
  task?: Task;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Nueva Tarea' : 'Editar Tarea' }}
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="taskForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Título</mat-label>
          <input matInput formControlName="title" placeholder="Título de la tarea">
          <mat-error *ngIf="taskForm.get('title')?.hasError('required')">
            El título es requerido
          </mat-error>
          <mat-error *ngIf="taskForm.get('title')?.hasError('maxlength')">
            El título no puede exceder 100 caracteres
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            placeholder="Descripción de la tarea"
            rows="4">
          </textarea>
          <mat-error *ngIf="taskForm.get('description')?.hasError('required')">
            La descripción es requerida
          </mat-error>
          <mat-error *ngIf="taskForm.get('description')?.hasError('maxlength')">
            La descripción no puede exceder 500 caracteres
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSave()"
        [disabled]="!taskForm.valid">
        {{ data.mode === 'create' ? 'Crear' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      width: 400px;
      min-height: 200px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    mat-dialog-actions {
      gap: 8px;
    }
  `]
})
export class TaskDialogComponent implements OnInit {
  taskForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: [
        this.data.task?.title || '', 
        [Validators.required, Validators.maxLength(100)]
      ],
      description: [
        this.data.task?.description || '', 
        [Validators.required, Validators.maxLength(500)]
      ]
    });
  }

  onSave(): void {
    if (this.taskForm.valid) {
      this.dialogRef.close(this.taskForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}