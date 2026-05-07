import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../../core/interfaces/service.interface';
import { CommonModule } from '@angular/common';

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

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.servicesService.getServices().subscribe({
      next: (data) => {
        console.log('Servicios desde API:', data);
        this.services = data;
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
    return this.services.reduce((acc, service) => acc + service.precio, 0);
  }

  verDetalle(service: Service): void {
    console.log('Ver detalle servicio:', service);
  }

  editarServicio(service: Service): void {
    console.log('Editar servicio:', service);
  }
}
