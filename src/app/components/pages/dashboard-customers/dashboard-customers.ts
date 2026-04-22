import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Customer } from '../../../core/interfaces/customer.interface';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../core/services/customer.service';
import { FormsModule } from '@angular/forms';


type MotoForm = {
  placa: string;
  marca: string;
  modelo: string;
  anio: string;
  abierta: boolean;
};

@Component({
  selector: 'app-dashboard-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-customers.html',
  styleUrl: './dashboard-customers.scss',
})
export class DashboardCustomers implements OnInit {
  private customerService = inject(CustomerService);
  private cdr = inject(ChangeDetectorRef);

  customers: Customer[] = [];
  isLoading = true;
  errorMessage = '';
  showNewCustomerModal = false;

  newCustomerForm = {
    nombre: '',
    telefono: '',
    email: '',
    documento: '',
  };
  motos: MotoForm[] = [];

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

  private crearMotoVacia(): MotoForm {
    return {
      placa: '',
      marca: '',
      modelo: '',
      anio: '',
      abierta: false,
    };
  }

  openNewCustomerModal(): void {
    this.showNewCustomerModal = true;

    this.newCustomerForm = {
      nombre: '',
      telefono: '',
      email: '',
      documento: '',
    };

    this.motos = [this.crearMotoVacia()];
  }

  closeNewCustomerModal(): void {
    this.showNewCustomerModal = false;
  }

  saveNewCustomerMock(): void {
    console.log('Formulario cliente listo para POST:', this.newCustomerForm);
    console.log('Cliente:', this.newCustomerForm);
    console.log('Motos:', this.motos);
    this.closeNewCustomerModal();
  }

  get totalMotos(): number {
    return this.customers.reduce((acc, customer) => acc + customer.cantidadMotos, 0);
  }

  toggleMotoForm(index: number): void {
    this.motos[index].abierta = !this.motos[index].abierta;
  }
  agregarMoto(): void {
    this.motos.push({
      placa: '',
      marca: '',
      modelo: '',
      anio: '',
      abierta: true,
    });
  }

  eliminarMoto(index: number): void {
    this.motos.splice(index, 1);
  }

  verDetalle(customer: Customer): void {
    console.log('Ver detalle:', customer);
  }

  editarCliente(customer: Customer): void {
    console.log('Editar cliente:', customer);
  }

}
