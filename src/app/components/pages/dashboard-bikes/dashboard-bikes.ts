import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bike, BikeCreateRequest } from '../../../core/interfaces/bike.interface';
import { BikesService } from '../../../core/services/bikes.service';
import { Customer, UsuarioStorage } from '../../../core/interfaces/customer.interface';
import { Exportdataexcel, ExportModalStatus } from '../../shared/exportdataexcel/exportdataexcel';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CustomerService } from '../../../core/services/customer.service';
import { FormsModule } from '@angular/forms';
import { Rol, RolService } from '../../../core/services/rol.service';

//* type for mapping the data for new bike
type NewBikeErrors = {
  placa?: string;
  marca?: string;
  modelo?: string;
  clienteId?: string;
}

@Component({
  selector: 'app-dashboard-bikes',
  imports: [Exportdataexcel, FormsModule],
  templateUrl: './dashboard-bikes.html',
  styleUrl: './dashboard-bikes.scss',
})
export class DashboardBikes implements OnInit {

  private bikeService = inject(BikesService);
  private customerService = inject(CustomerService)
  private cdr = inject(ChangeDetectorRef);

  rolUser = '';
  rolId: number | null = null;


  bikes: Bike[] = [];
  customers: Customer[] = [];

  isLoading = true;
  errorMessage = '';

  showNewBikeModal = false;
  isSavingBike = false;
  newBikeFormSubmitted = false;
  newBikeErrorMessage = '';

  bikeToDelete: Bike | null = null;
  showDeleteBikeModal = false;

  isDeletingBike = false;

  newBikeForm = {
    placa: '',
    marca: '',
    modelo: '',
    clienteId: null as number | null,
  };

  newBikeErrors: NewBikeErrors = {};

  //* Variables to excel
  showExportBikesModal = false;
  exportBikesStatus: ExportModalStatus = 'confirm';
  exportSuccessMessage = '';
  exportErrorMessage = '';

  ngOnInit(): void {
    this.loadBikes();
    this.loadCustomers();
    this.loadUserRole();
  }

  //* Method for call the form to insert the data
  openNewBikeModal(): void {
    this.showNewBikeModal = true;
    this.isSavingBike = false;
    this.newBikeFormSubmitted = false;
    this.newBikeErrorMessage = '';

    this.newBikeForm = {
      placa: '',
      marca: '',
      modelo: '',
      clienteId: null,
    };

    this.newBikeErrors = {
      placa: '',
      marca: '',
      modelo: '',
      clienteId: '',
    };

    if (this.customers.length === 0) {
      this.loadCustomers();
    }

    this.cdr.detectChanges();
  }

  //* Method for close the form
  closeNewBikeModal(): void {
    if (this.isSavingBike) return;

    this.showNewBikeModal = false;
    this.newBikeErrorMessage = '';
    this.newBikeFormSubmitted = false;
    this.newBikeErrors = {};
  }

  //* Method for load the bikes in the table
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

        if (error.status === 401) {
          this.errorMessage = 'Tu sesión expiró o no tienes autorización. Inicia sesión nuevamente.';
        } else {
          this.errorMessage = 'No se pudieron cargar las motos.';
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  //* Method for call the modal to delete the bike
  deleteBike(bike: Bike): void {
    this.bikeToDelete = bike;
    this.showDeleteBikeModal = true;
  }

  closeDeleteBikeModal(): void {
    if (this.isDeletingBike) return;
    this.showDeleteBikeModal = false;
    this.bikeToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDeleteBike(): void {
    console.log("Metodo que se implementará para borrar la moto");
  }

  //* Method for load the customers in the select form
  loadCustomers(): void {
    this.customerService.getClientes().subscribe({
      next: (data) => {
        console.log('Clientes para select:', data);
        this.customers = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.customers = [];
        this.cdr.detectChanges();
      },
    });
  }

  //* Method for save the data and insert into DB
  saveNewBike(): void {
    this.newBikeFormSubmitted = true;
    this.newBikeErrorMessage = '';
    this.newBikeErrors = this.validateNewBikeForm();

    if (Object.keys(this.newBikeErrors).some((key) => this.newBikeErrors[key as keyof typeof this.newBikeErrors])) {
      this.cdr.detectChanges();
      return;
    }

    const payload: BikeCreateRequest = {
      placa: this.newBikeForm.placa.trim().toUpperCase(),
      marca: this.capitalizeFirstLetter(this.newBikeForm.marca.trim()),
      modelo: this.newBikeForm.modelo.trim(),
      clienteId: Number(this.newBikeForm.clienteId),
    };

    this.isSavingBike = true;
    this.cdr.detectChanges();

    this.bikeService.createBike(payload).subscribe({
      next: (response) => {
        console.log('Moto creada:', response);

        this.isSavingBike = false;
        this.closeNewBikeModal();
        this.loadBikes();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creando moto:', error);

        this.isSavingBike = false;
        this.newBikeErrorMessage = 'No se pudo registrar la moto. Revisa los datos e intenta nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }

  //* Call the modal export to excel
  openExportBikesModal(): void {
    this.exportBikesStatus = 'confirm';
    this.exportSuccessMessage = '';
    this.exportErrorMessage = '';
    this.showExportBikesModal = true;
  }

  //* End the modal export in excel
  closeExportBikesModal(): void {
    this.showExportBikesModal = false;
    this.exportBikesStatus = 'confirm';
    this.exportSuccessMessage = '';
    this.exportErrorMessage = '';
  }

  //* Modal confirm to export excel
  confirmExportBikes(): void {
    if (this.bikes.length === 0) {
      this.exportBikesStatus = 'error';
      this.exportErrorMessage = 'No hay motos registradas para exportar.';
      this.cdr.detectChanges();
      return;
    }

    this.exportBikesStatus = 'loading';
    this.cdr.detectChanges();

    setTimeout(() => {
      try {
        this.exportBikesToExcel();

        this.exportSuccessMessage = `Se exportaron ${this.bikes.length} motos correctamente.`;
        this.exportBikesStatus = 'success';
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error exportando motos:', error);

        this.exportErrorMessage = 'No se pudo generar el archivo Excel de motos.';
        this.exportBikesStatus = 'error';
        this.cdr.detectChanges();
      }
    }, 900);
  }

  //* Method to export excel in pc
  private async exportBikesToExcel(): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Motos');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Placa', key: 'placa', width: 18 },
      { header: 'Marca', key: 'marca', width: 20 },
      { header: 'Modelo', key: 'modelo', width: 22 },
      { header: 'Cliente', key: 'nombreCliente', width: 28 },
      { header: 'Cliente ID', key: 'clienteId', width: 14 },
    ];

    this.bikes.forEach((bike) => {
      worksheet.addRow({
        id: bike.id,
        placa: bike.placa || 'Sin placa',
        marca: bike.marca || 'Sin marca',
        modelo: bike.modelo || 'Sin modelo',
        nombreCliente: bike.nombreCliente || 'Sin cliente',
        clienteId: bike.clienteId ?? 'N/A',
      });
    });

    worksheet.getRow(1).font = { bold: true };

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `motos_tallermotos_${this.getTodayFileName()}.xlsx`;

    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      fileName
    );
  }

  //* Method for get the date to excel
  private getTodayFileName(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  //* Method for validate the inputs values
  private validateNewBikeForm(): NewBikeErrors {
    const errors: NewBikeErrors = {};

    const placa = this.newBikeForm.placa.trim().toUpperCase();
    const marca = this.newBikeForm.marca.trim();
    const modelo = this.newBikeForm.modelo.trim();
    const clienteId = this.newBikeForm.clienteId;

    const placaMotoColombiaRegex = /^[A-Z]{3}\d{2}[A-Z]$/;

    if (!placa) {
      errors.placa = 'La placa es obligatoria.';
    } else if (!placaMotoColombiaRegex.test(placa)) {
      errors.placa = 'La placa debe tener formato de moto. Ej: ABC12D.';
    }

    if (!marca) {
      errors.marca = 'La marca es obligatoria.';
    }

    if (!modelo) {
      errors.modelo = 'El modelo es obligatorio.';
    }

    if (!clienteId) {
      errors.clienteId = 'Debes seleccionar un cliente.';
    }

    return errors;
  }

  //* Regex for placa
  onBikePlacaInput(): void {
    this.newBikeForm.placa = this.newBikeForm.placa
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
  }

  //* Regex for Marca
  onBikeMarcaInput(): void {
    this.newBikeForm.marca = this.capitalizeFirstLetter(this.newBikeForm.marca);
  }

  //* To capitalizer the first leter of Marca
  private capitalizeFirstLetter(value: string): string {
    const cleanValue = value.trimStart();

    if (!cleanValue) return '';

    return cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1);
  }

  //* Method for get bikes associated with his self customers
  get associatedCustomers(): number {
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

  get isAdmin(): boolean {
    return Number(this.rolId) === 1;
  }

  private loadUserRole(): void {
    try {
      const usuarioGuardado = localStorage.getItem('usuario');

      if (!usuarioGuardado) {
        this.rolUser = 'Sin rol';
        this.rolId = null;
        return;
      }

      const usuario: UsuarioStorage = JSON.parse(usuarioGuardado);

      this.rolId = Number(usuario.rolId);

      this.rolUser = this.rolId === 1
        ? 'Administrador'
        : this.rolId === 2
          ? 'Mecánico'
          : 'Sin rol';

      console.log('Rol ID:', this.rolId);
      console.log('Rol mapeado:', this.rolUser);
    } catch (error) {
      console.error('Error leyendo usuario desde localStorage:', error);
      this.rolUser = 'Sin rol';
      this.rolId = null;
    }
  }

}
