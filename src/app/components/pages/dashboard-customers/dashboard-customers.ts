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

  selectedCustomer: Customer | null = null;
  showCustomerDetailModal = false;

  newCustomerForm = {
    nombre: '',
    telefono: '',
    email: '',
    documento: '',
    tipoDocumento: 1,
  };
  motos: MotoForm[] = [];

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getCustomersBikes().subscribe({
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
      tipoDocumento: 1,
    };

    this.motos = [this.crearMotoVacia()];
  }

  closeNewCustomerModal(): void {
    this.showNewCustomerModal = false;
  }

  saveNewCustomer(): void {
    const motosValidas = this.motos
      .filter((moto) => moto.placa.trim() || moto.marca.trim() || moto.modelo.trim())
      .map((moto) => ({
        marca: moto.marca.trim(),
        modelo: moto.modelo.trim(),
        placa: moto.placa.trim(),
      }));

    const payload = {
      nombre: this.newCustomerForm.nombre.trim(),
      telefono: this.newCustomerForm.telefono.trim(),
      correo: this.newCustomerForm.email.trim(),
      documento: this.newCustomerForm.documento.trim(),
      tipoDocumento: Number(this.newCustomerForm.tipoDocumento),
      motos: motosValidas,
    };

    console.log('Payload enviado:', payload);

    this.customerService.crearClienteConMotos(payload).subscribe({
      next: (response) => {
        console.log('Cliente creado:', response);
        this.closeNewCustomerModal();
        this.loadCustomers();
      },
      error: (error) => {
        console.log('Error creando cliente:', error);
      },
    });
  }

  get totalMotos(): number {
    return this.customers.reduce(
      (acc, customer) => acc + (customer.cantidadMotos ?? customer.motos?.length ?? 0),
      0
    );
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
    this.selectedCustomer = customer;
    this.showCustomerDetailModal = true;
  }

  closeCustomerDetailModal(): void {
    this.showCustomerDetailModal = false;
    this.selectedCustomer = null;
  }

  editarCliente(customer: Customer): void {
    console.log('Editar cliente:', customer);
  }

}
