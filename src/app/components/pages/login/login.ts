import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  onLogin(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Debes ingresar usuario y contraseña.';
      return;
    }

    this.loading = true;

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.authService.saveSession(response);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.loading = false;
        this.errorMessage = 'Usuario o contraseña incorrectos.';
      }
    });
  }


}
