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

  formSubmitted = false;

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

  newCustomerErrors = {
    nombre: '',
    telefono: '',
    email: '',
    tipoDocumento: '',
    documento: '',
  };

  motoErrors: {
    placa: string;
    marca: string;
    modelo: string;
    anio: string;
  }[] = [];

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
    this.formSubmitted = false;

    this.newCustomerForm = {
      nombre: '',
      telefono: '',
      email: '',
      documento: '',
      tipoDocumento: 1,
    };

    this.motos = [this.crearMotoVacia()];
    this.resetValidationErrors();
  }

  closeNewCustomerModal(): void {
    this.showNewCustomerModal = false;
  }

  saveNewCustomer(): void {
    this.formSubmitted = true;

    if (!this.validateNewCustomerForm()) {
      this.cdr.detectChanges();
      return;
    }

    const motosValidas = this.motos.map((moto) => ({
      marca: this.capitalizeFirst(moto.marca.trim()),
      modelo: moto.modelo.trim(),
      placa: this.normalizePlate(moto.placa.trim()),
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

    this.motoErrors.push({
      placa: '',
      marca: '',
      modelo: '',
      anio: '',
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
    this.motoErrors.splice(index, 1);
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
  private resetValidationErrors(): void {
    this.newCustomerErrors = {
      nombre: '',
      telefono: '',
      email: '',
      tipoDocumento: '',
      documento: '',
    };

    this.motoErrors = this.motos.map(() => ({
      placa: '',
      marca: '',
      modelo: '',
      anio: '',
    }));
  }

  onlyNumbers(value: string): string {
    return value.replace(/\D/g, '');
  }

  capitalizeFirst(value: string): string {
    const cleanValue = value.trimStart();

    if (!cleanValue) return '';

    return cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1);
  }

  normalizePlate(value: string): string {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
  }

  onTelefonoInput(): void {
    this.newCustomerForm.telefono = this.onlyNumbers(this.newCustomerForm.telefono);
  }

  onDocumentoInput(): void {
    this.newCustomerForm.documento = this.onlyNumbers(this.newCustomerForm.documento);
  }

  onMotoPlacaInput(index: number): void {
    this.motos[index].placa = this.normalizePlate(this.motos[index].placa);
  }

  onMotoMarcaInput(index: number): void {
    this.motos[index].marca = this.capitalizeFirst(this.motos[index].marca);
  }

  onMotoAnioInput(index: number): void {
    this.motos[index].anio = this.onlyNumbers(this.motos[index].anio).slice(0, 4);
  }

  private validateNewCustomerForm(): boolean {
    this.resetValidationErrors();

    let isValid = true;

    const nombre = this.newCustomerForm.nombre.trim();
    const telefono = this.newCustomerForm.telefono.trim();
    const email = this.newCustomerForm.email.trim();
    const documento = this.newCustomerForm.documento.trim();
    const tipoDocumento = Number(this.newCustomerForm.tipoDocumento);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const placaRegex = /^([A-Z]{3}\d{2}[A-Z]|[A-Z]{3}\d{3})$/;

    const currentYear = new Date().getFullYear();

    if (!nombre) {
      this.newCustomerErrors.nombre = 'El nombre completo es obligatorio.';
      isValid = false;
    } else if (nombre.split(/\s+/).length < 2) {
      this.newCustomerErrors.nombre = 'Ingresa mínimo nombre y apellido.';
      isValid = false;
    }

    if (!telefono) {
      this.newCustomerErrors.telefono = 'El teléfono es obligatorio.';
      isValid = false;
    } else if (!/^\d+$/.test(telefono)) {
      this.newCustomerErrors.telefono = 'El teléfono solo debe contener números.';
      isValid = false;
    }

    if (!email) {
      this.newCustomerErrors.email = 'El correo electrónico es obligatorio.';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      this.newCustomerErrors.email = 'Ingresa un correo electrónico válido.';
      isValid = false;
    }

    if (!tipoDocumento || tipoDocumento <= 0) {
      this.newCustomerErrors.tipoDocumento = 'Selecciona un tipo de documento.';
      isValid = false;
    }

    if (!documento) {
      this.newCustomerErrors.documento = 'El documento es obligatorio.';
      isValid = false;
    } else if (!/^\d+$/.test(documento)) {
      this.newCustomerErrors.documento = 'El documento solo debe contener números.';
      isValid = false;
    } else if (documento.length < 5) {
      this.newCustomerErrors.documento = 'El documento debe tener mínimo 5 caracteres.';
      isValid = false;
    }

    this.motos.forEach((moto, index) => {
      const placa = moto.placa.trim().toUpperCase();
      const marca = moto.marca.trim();
      const modelo = moto.modelo.trim();
      const anio = moto.anio.trim();

      if (!placa) {
        this.motoErrors[index].placa = 'La placa es obligatoria.';
        isValid = false;
      } else if (!placaRegex.test(placa)) {
        this.motoErrors[index].placa = 'Formato inválido. Ej: ABC12D o ABC123.';
        isValid = false;
      }

      if (!marca) {
        this.motoErrors[index].marca = 'La marca es obligatoria.';
        isValid = false;
      }

      if (!modelo) {
        this.motoErrors[index].modelo = 'El modelo es obligatorio.';
        isValid = false;
      }

      if (!anio) {
        this.motoErrors[index].anio = 'El año es obligatorio.';
        isValid = false;
      } else if (!/^\d{4}$/.test(anio)) {
        this.motoErrors[index].anio = 'El año debe tener 4 números.';
        isValid = false;
      } else {
        const year = Number(anio);

        if (year < 1950 || year > currentYear + 1) {
          this.motoErrors[index].anio = `Ingresa un año entre 1950 y ${currentYear + 1}.`;
          isValid = false;
        }
      }
    });

    return isValid;
  }

  async confirmExportCustomers(): Promise<void> {
    if (this.isExportingCustomers) return;

    this.isExportingCustomers = true;
    this.cdr.detectChanges();

    await this.waitForUi();

    try {
      const workbook = new ExcelJS.Workbook();
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
        const motosTexto =
          customer.motos && customer.motos.length > 0
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

      // Espera visual bonita
      await this.delay(1200);

      this.showExportCustomersModal = false;
      this.exportSuccessMessage = `Se exportaron ${this.customers.length} clientes correctamente.`;
      this.showExportSuccessModal = true;
    } catch (error) {
      console.error('Error exportando clientes:', error);

      await this.delay(800);

      this.showExportCustomersModal = false;
      this.exportErrorMessage =
        'No se pudo generar el archivo Excel. Intenta nuevamente.';
      this.showExportErrorModal = true;
    } finally {
      this.isExportingCustomers = false;
      this.cdr.detectChanges();
    }
  }

  private waitForUi(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  private getTodayFileName(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

}
