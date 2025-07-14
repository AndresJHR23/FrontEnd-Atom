import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '../../services/user.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const email = this.loginForm.value.email;

      this.userService.findByEmail(email).subscribe({
        next: (user) => {
          this.loading = false;
          if (user) {
            this.userService.setCurrentUser(user);
            this.router.navigate(['/tasks']);
            this.showMessage('¡Bienvenido de vuelta!');
          } else {
            this.showCreateUserDialog(email);
          }
        },
        error: (error) => {
          this.loading = false;
          this.showMessage('Error al verificar usuario');
          console.error('Error:', error);
        }
      });
    }
  }

  private showCreateUserDialog(email: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Usuario no encontrado',
        message: `El usuario con email ${email} no existe. ¿Deseas crear una nueva cuenta?`,
        confirmText: 'Crear usuario',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createUser(email);
      }
    });
  }

  private createUser(email: string): void {
    this.loading = true;
    this.userService.createUser({ email }).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['/tasks']);
        this.showMessage('¡Usuario creado exitosamente!');
      },
      error: (error) => {
        this.loading = false;
        this.showMessage('Error al crear usuario');
        console.error('Error:', error);
      }
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}