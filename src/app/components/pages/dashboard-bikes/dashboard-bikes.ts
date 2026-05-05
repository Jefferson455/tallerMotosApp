import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bike } from '../../../core/interfaces/bike.interface';
import { BikesService } from '../../../core/services/bikes.service';
import { Customer } from '../../../core/interfaces/customer.interface';

@Component({
  selector: 'app-dashboard-bikes',
  imports: [],
  templateUrl: './dashboard-bikes.html',
  styleUrl: './dashboard-bikes.scss',
})
export class DashboardBikes implements OnInit {

  private bikeService = inject(BikesService);
  private cdr = inject(ChangeDetectorRef);

  bikes: Bike[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadBikes();
  }

  loadBikes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bikeService.getBikes().subscribe({
      next: (data) => {
        this.bikes = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando motos:', error);
        this.errorMessage = 'No se pudieron cargar las motos.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get asocciatedCustomers(): number {
    const clientes = this.bikes
      .map((bike) => bike.clienteId ?? bike.nombreCliente)
      .filter(Boolean);

    return new Set(clientes).size;
  }

  verDetalle(bike: Bike): void {
    console.log('Ver detalle moto:', bike);
  }

  editarMoto(bike: Bike): void {
    console.log('Editar moto:', bike);
  }

}
