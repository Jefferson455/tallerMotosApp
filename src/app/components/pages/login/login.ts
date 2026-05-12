import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);


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
    this.cdr.detectChanges();

    this.authService
      .login({
        username: this.username.trim(),
        password: this.password.trim(),
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.authService.saveSession(response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.errorMessage = 'Usuario o contraseña incorrectos.';
          this.cdr.detectChanges();
        },
      });

  }


}
