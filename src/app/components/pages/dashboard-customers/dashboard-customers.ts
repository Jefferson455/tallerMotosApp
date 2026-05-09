import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Customer } from '../../../core/interfaces/customer.interface';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../core/services/customer.service';
import { FormsModule } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


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
  showEditCustomerModal = false;

  customerToDelete: Customer | null = null;
  showDeleteCustomerModal = false;
  isDeletingCustomer = false;

  showDeleteErrorModal = false;
  deleteErrorMessage = '';
  deleteErrorCustomerName = '';

  showDeleteSuccessModal = false;
  deleteSuccessCustomerName = '';

  showExportCustomersModal = false;
  isExportingCustomers = false;

  showExportSuccessModal = false;
  exportSuccessMessage = '';

  showExportErrorModal = false;
  exportErrorMessage = '';

  newCustomerForm = {
    nombre: '',
    telefono: '',
    email: '',
    documento: '',
    tipoDocumento: 1,
  };

  editCustomerForm = {
    id: 0,
    nombre: '',
    telefono: '',
    correo: '',
    documento: '',
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
        this.customers = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'No se pudieron cargar los clientes.', error;
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

  openEditCustomerModal(customer: Customer): void {
    this.editCustomerForm = {
      id: customer.id,
      nombre: customer.nombre || '',
      telefono: customer.telefono || '',
      correo: customer.correo || '',
      documento: customer.documento || '',
    };

    this.showEditCustomerModal = true;
  }

  closeEditCustomerModal(): void {
    this.showEditCustomerModal = false;
  }

  updateCustomer(): void {
    const payload = {
      nombre: this.editCustomerForm.nombre.trim(),
      telefono: this.editCustomerForm.telefono.trim(),
      correo: this.editCustomerForm.correo.trim(),
      documento: this.editCustomerForm.documento.trim(),
    };

    this.customerService.updateCustomer(this.editCustomerForm.id, payload).subscribe({
      next: (response) => {
        this.closeEditCustomerModal();
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error actualizando cliente:', error);
      },
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
    this.openEditCustomerModal(customer);
  }

  deleteCustomer(customer: Customer): void {
    this.customerToDelete = customer;
    this.showDeleteCustomerModal = true;
  }

  closeDeleteCustomerModal(): void {
    if (this.isDeletingCustomer) return;

    this.showDeleteCustomerModal = false;
    this.customerToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDeleteCustomer(): void {
    if (!this.customerToDelete || this.isDeletingCustomer) return;

    this.isDeletingCustomer = true;
    this.cdr.detectChanges();

    this.customerService.deleteCustomer(this.customerToDelete.id).subscribe({
      next: () => {
        const deletedName = this.customerToDelete?.nombre ?? 'Cliente';

        this.isDeletingCustomer = false;
        this.showDeleteCustomerModal = false;
        this.customerToDelete = null;

        this.deleteSuccessCustomerName = deletedName;
        this.showDeleteSuccessModal = true;

        this.cdr.detectChanges();

        this.loadCustomers();
      },

      error: (error) => {
        console.error('Error eliminando cliente:', error);

        const customerName = this.customerToDelete?.nombre ?? 'Cliente';

        this.isDeletingCustomer = false;
        this.showDeleteCustomerModal = false;
        this.customerToDelete = null;

        this.deleteErrorCustomerName = customerName;
        this.deleteErrorMessage =
          typeof error?.error === 'string'
            ? error.error
            : error?.error?.message ||
            'No se pudo eliminar el cliente. Intenta nuevamente más tarde.';

        this.showDeleteErrorModal = true;

        this.cdr.detectChanges();
      },
    });
  }

  closeDeleteErrorModal(): void {
    this.showDeleteErrorModal = false;
    this.deleteErrorMessage = '';
    this.deleteErrorCustomerName = '';
    this.cdr.detectChanges();
  }

  closeDeleteSuccessModal(): void {
    this.showDeleteSuccessModal = false;
    this.deleteSuccessCustomerName = '';
  }

  openExportCustomersModal(): void {
    this.showExportCustomersModal = true;
  }

  closeExportCustomersModal(): void {
    if (this.isExportingCustomers) return;
    this.showExportCustomersModal = false;
  }

  closeExportSuccessModal(): void {
    this.showExportSuccessModal = false;
    this.exportSuccessMessage = '';
  }

  closeExportErrorModal(): void {
    this.showExportErrorModal = false;
    this.exportErrorMessage = '';
  }

  async confirmExportCustomers(): Promise<void> {
    if (this.customers.length === 0) {
      this.showExportCustomersModal = false;
      this.exportErrorMessage = 'No hay clientes registrados para exportar.';
      this.showExportErrorModal = true;
      return;
    }

    try {
      this.isExportingCustomers = true;

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'TallerMotosApp';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Clientes');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 28 },
        { header: 'Teléfono', key: 'telefono', width: 18 },
        { header: 'Correo', key: 'correo', width: 30 },
        { header: 'Documento', key: 'documento', width: 18 },
        { header: 'Tipo documento', key: 'tipoDocumento', width: 26 },
        { header: 'Motos registradas', key: 'cantidadMotos', width: 18 },
        { header: 'Motos', key: 'motos', width: 45 },
      ];

      this.customers.forEach((customer) => {
        const motosTexto = customer.motos && customer.motos.length > 0
          ? customer.motos
            .map((moto) => `${moto.marca} ${moto.modelo} - ${moto.placa}`)
            .join(' | ')
          : 'Sin motos';

        worksheet.addRow({
          id: customer.id,
          nombre: customer.nombre,
          telefono: customer.telefono,
          correo: customer.correo || 'Sin correo',
          documento: customer.documento || 'Sin documento',
          tipoDocumento:
            customer.tipoDocumentoNombre ||
            customer.tipoDocumentoCodigo ||
            'Sin tipo',
          cantidadMotos: customer.cantidadMotos ?? customer.motos?.length ?? 0,
          motos: motosTexto,
        });
      });

      const headerRow = worksheet.getRow(1);

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' },
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF97316' },
        };

        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
      });

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          };

          cell.alignment = {
            vertical: 'middle',
            wrapText: true,
          };
        });
      });

      worksheet.getRow(1).height = 24;

      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `clientes_tallermotos_${this.getTodayFileName()}.xlsx`;

      saveAs(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        fileName
      );

      this.isExportingCustomers = false;
      this.showExportCustomersModal = false;

      this.exportSuccessMessage = `Se exportaron ${this.customers.length} clientes correctamente.`;
      this.showExportSuccessModal = true;
    } catch (error) {
      console.error('Error exportando clientes:', error);

      this.isExportingCustomers = false;
      this.showExportCustomersModal = false;

      this.exportErrorMessage = 'No se pudo generar el archivo Excel. Intenta nuevamente.';
      this.showExportErrorModal = true;
    }
  }

  private getTodayFileName(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

}
