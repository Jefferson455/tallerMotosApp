import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RolService, Rol } from '../../../core/services/rol.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
interface UsuarioStorage {
  id: number;
  nombre: string;
  username: string;
  rolId: number;
}

@Component({
  selector: 'app-asidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './asidebar.html',
  styleUrl: './asidebar.scss',
})
export class Asidebar implements OnInit {
  private rolesService = inject(RolService);
  private cdr = inject(ChangeDetectorRef);

  userName = '';
  rolUser = 'Cargando rol...';

  private mapearRol(nombreRol: string): string {
    const rolesMap: Record<string, string> = {
      ADMIN: 'Administrador',
      MECANICO: 'Mecánico',
    };

    return rolesMap[nombreRol] || nombreRol;
  }

  ngOnInit(): void {
    try {
      const usuarioGuardado = localStorage.getItem('usuario');

      if (!usuarioGuardado) {
        this.userName = 'Usuario';
        this.rolUser = 'Sin rol';
        return;
      }

      const usuario: UsuarioStorage = JSON.parse(usuarioGuardado);

      this.userName = usuario.nombre || usuario.username || 'Usuario';

      this.rolesService.getRoles().subscribe({
        next: (roles: Rol[]) => {
          const rolEncontrado = roles.find(
            (rol) => Number(rol.id) === Number(usuario.rolId)
          );

          this.rolUser = rolEncontrado
            ? this.mapearRol(rolEncontrado.nombre)
            : 'Rol no encontrado';

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error consultando roles:', error);
          this.rolUser = 'Error al cargar rol';
          this.cdr.detectChanges();
        },
      });
    } catch (error) {
      console.error('Error leyendo el usuario desde localStorage:', error);
      this.userName = 'Usuario';
      this.rolUser = 'Sin rol';
      this.cdr.detectChanges();
    }
  }
}
