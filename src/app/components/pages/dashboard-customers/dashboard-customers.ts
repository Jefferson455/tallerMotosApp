import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Customer } from '../../../core/interfaces/customer.interface';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-dashboard-customers',
  imports: [CommonModule],
  templateUrl: './dashboard-customers.html',
  styleUrl: './dashboard-customers.scss',
})
export class DashboardCustomers implements OnInit {
  private customerService = inject(CustomerService);
  private cdr = inject(ChangeDetectorRef);

  customers: Customer[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getClientes().subscribe({
      next: (data) => {
        console.log('Clientes desde API:', data);
        this.customers = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.errorMessage = 'No se pudieron cargar los clientes.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get totalMotos(): number {
    return this.customers.reduce((acc, customer) => acc + customer.cantidadMotos, 0);
  }
}
