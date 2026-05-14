import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../../core/interfaces/service.interface';
import { CommonModule } from '@angular/common';
import { UsuarioStorage } from '../../../core/interfaces/customer.interface';

@Component({
  selector: 'app-dashboard-services',
  imports: [CommonModule],
  templateUrl: './dashboard-services.html',
  styleUrl: './dashboard-services.scss',
})
export class DashboardServices implements OnInit {
  private servicesService = inject(ServicesService);
  private cdr = inject(ChangeDetectorRef);

  services: Service[] = [];
  isLoading = true;
  errorMessage = '';

  rolUser = '';
  rolId: number | null = null;
  userId: number | null = null;
  userName = '';

  ngOnInit(): void {
    this.loadUserRole();
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.servicesService.getServices().subscribe({
      next: (data) => {
        if (this.isAdmin) {
          this.services = data;
        } else if (this.isMechanic && this.userId !== null) {
          this.services = data.filter(
            (service) => Number(service.usuarioId) === Number(this.userId)
          );
        } else {
          this.services = [];
        }


        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando servicios:', error);
        this.errorMessage = 'No se pudieron cargar los servicios.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get totalIngresos(): number {
    return this.services.reduce((acc, service) => acc + service.costo, 0);
  }

  verDetalle(service: Service): void {
    console.log('Ver detalle servicio:', service);
  }

  editarServicio(service: Service): void {
    console.log('Editar servicio:', service);
  }

  get isAdmin(): boolean {
    return Number(this.rolId) === 1;
  }

  get isMechanic(): boolean {
    return Number(this.rolId) === 2;
  }

  private loadUserRole(): void {
    try {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (!usuarioGuardado) {
        this.rolUser = 'Sin rol';
        this.rolId = null;
        this.userId = null;
        return;
      }
      const usuario: UsuarioStorage = JSON.parse(usuarioGuardado);
      this.userId = Number(usuario.id);
      this.rolId = Number(usuario.rolId);
      this.userName = String(usuario.nombre);

      this.rolUser = this.rolId === 1
        ? 'Administrador'
        : this.rolId === 2
          ? 'Mecánico'
          : 'Sin rol';
    } catch (error) {
      console.error('Error leyendo usuario desde localStorage:', error);
      this.rolUser = 'Sin rol';
      this.rolId = null;
    }
  }
}
