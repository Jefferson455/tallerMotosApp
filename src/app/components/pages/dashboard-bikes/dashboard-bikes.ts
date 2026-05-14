import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Bike, BikeCreateRequest } from '../../../core/interfaces/bike.interface';
import { BikesService } from '../../../core/services/bikes.service';
import { Customer, UsuarioStorage } from '../../../core/interfaces/customer.interface';
import { Exportdataexcel, ExportModalStatus } from '../../shared/exportdataexcel/exportdataexcel';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CustomerService } from '../../../core/services/customer.service';
import { FormsModule } from '@angular/forms';
import { Service } from '../../../core/interfaces/service.interface';
import { ServicesService } from '../../../core/services/services.service';
import { CommonModule } from '@angular/common';
//* type for mapping the data for new bike
type NewBikeErrors = {
  placa?: string;
  marca?: string;
  modelo?: string;
  clienteId?: string;
}

@Component({
  selector: 'app-dashboard-bikes',
  imports: [Exportdataexcel, FormsModule, CommonModule],
  templateUrl: './dashboard-bikes.html',
  styleUrl: './dashboard-bikes.scss',
})
export class DashboardBikes implements OnInit {

  private bikeService = inject(BikesService);
  private customerService = inject(CustomerService)
  private cdr = inject(ChangeDetectorRef);
  private servicesService = inject(ServicesService);

  //* Variables to validate the rol
  rolUser = '';
  rolId: number | null = null;

  //* Variables to load bikes
  bikes: Bike[] = [];
  customers: Customer[] = [];

  //* Variables to validate if is load the data in the table
  isLoading = true;
  errorMessage = '';

  //* Variables to load modal "Nueva moto"
  showNewBikeModal = false;
  isSavingBike = false;
  newBikeFormSubmitted = false;
  newBikeErrorMessage = '';

  //* Variables for modal "ver"
  selectedBike: Bike | null = null;
  showBikeDetailModal = false;

  //* Variables for modal "edit"
  bikeToEdit: Bike | null = null;
  showEditBikeModal = false;
  isUpdatingBike = false;
  editBikeFormSubmitted = false;
  editBikeErrorMessage = '';

  //* Variables to "delete" one bike
  bikeToDelete: Bike | null = null;
  showDeleteBikeModal = false;
  isDeletingBike = false;
  showDeleteBikeSuccessModal = false;
  deleteBikeSuccessMessage = '';
  showDeleteBikeErrorModal = false;
  deleteBikeErrorMessage = '';

  //* variables to take the errors
  newBikeErrors: NewBikeErrors = {};

  //* Variables to excel
  showExportBikesModal = false;
  exportBikesStatus: ExportModalStatus = 'confirm';
  exportSuccessMessage = '';
  exportErrorMessage = '';

  //* Variables to load services
  selectedBikeServices: Service[] = [];
  isLoadingBikeServices = false;
  bikeServicesErrorMessage = '';

  //* Model for insert new bike
  newBikeForm = {
    placa: '',
    marca: '',
    modelo: '',
    clienteId: null as number | null,
  };

  //* Model for edit the bike
  editBikeForm = {
    placa: '',
    marca: '',
    modelo: '',
  };
  //* Model for edit the bike - take the errors
  editBikeErrors = {
    placa: '',
    marca: '',
    modelo: '',
  };

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
          this.errorMessage = 'Tal vez tu sesión expiró, inicia sesión nuevamente.';
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
    this.cdr.detectChanges();
  }

  closeDeleteBikeModal(): void {
    if (this.isDeletingBike) return;

    this.showDeleteBikeModal = false;
    this.bikeToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDeleteBike(): void {
    if (!this.bikeToDelete) return;

    this.isDeletingBike = true;
    this.cdr.detectChanges();

    this.bikeService.deleteBike(this.bikeToDelete.id).subscribe({
      next: (response) => {

        const deletedPlate = this.bikeToDelete?.placa || 'la moto';

        this.isDeletingBike = false;
        this.showDeleteBikeModal = false;
        this.bikeToDelete = null;

        this.deleteBikeSuccessMessage = `La moto ${deletedPlate} fue eliminada correctamente.`;
        this.showDeleteBikeSuccessModal = true;

        this.loadBikes();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isDeletingBike = false;
        this.showDeleteBikeModal = false;

        this.deleteBikeErrorMessage =
          error?.error || 'No se pudo eliminar la moto. Intenta nuevamente.';

        this.showDeleteBikeErrorModal = true;
        this.cdr.detectChanges();
      },
    });
  }

  closeDeleteBikeSuccessModal(): void {
    this.showDeleteBikeSuccessModal = false;
    this.deleteBikeSuccessMessage = '';
    this.cdr.detectChanges();
  }

  closeDeleteBikeErrorModal(): void {
    this.showDeleteBikeErrorModal = false;
    this.deleteBikeErrorMessage = '';
    this.cdr.detectChanges();
  }

  //* Method for load the customers in the select form
  loadCustomers(): void {
    this.customerService.getClientes().subscribe({
      next: (data) => {
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

  //* Method to see the details, button "ver", open modal.
  viewBikeDetail(bike: Bike): void {
    this.selectedBike = bike;
    this.showBikeDetailModal = true;

    this.selectedBikeServices = [];
    this.bikeServicesErrorMessage = '';

    this.loadBikeServices(bike);

    this.cdr.detectChanges();
  }

  //* Method to close the modal bikedetails
  closeBikeDetailModal(): void {
    this.showBikeDetailModal = false;
    this.selectedBike = null;
    this.selectedBikeServices = [];
    this.bikeServicesErrorMessage = '';
    this.isLoadingBikeServices = false;

    this.cdr.detectChanges();
  }

  //* Method to edit the bike
  editBike(bike: Bike): void {
    this.bikeToEdit = bike;

    this.editBikeForm = {
      placa: bike.placa || '',
      marca: bike.marca || '',
      modelo: bike.modelo || '',
    };

    this.editBikeErrors = {
      placa: '',
      marca: '',
      modelo: '',
    };

    this.editBikeErrorMessage = '';
    this.editBikeFormSubmitted = false;
    this.showEditBikeModal = true;

    this.cdr.detectChanges();
  }

  //* Method to save the edit of the bike
  saveEditBike(): void {
    if (!this.bikeToEdit) return;

    this.editBikeFormSubmitted = true;
    this.editBikeErrorMessage = '';
    this.editBikeErrors = this.validateEditBikeForm();

    if (Object.values(this.editBikeErrors).some((error) => error)) {
      this.cdr.detectChanges();
      return;
    }

    const payload = {
      marca: this.capitalizeFirstLetter(this.editBikeForm.marca.trim()),
      modelo: this.editBikeForm.modelo.trim(),
      placa: this.editBikeForm.placa.trim().toUpperCase(),
    };

    this.isUpdatingBike = true;
    this.cdr.detectChanges();

    this.bikeService.updateBike(this.bikeToEdit.id, payload).subscribe({
      next: (response) => {

        this.isUpdatingBike = false;
        this.closeEditBikeModal();
        this.closeBikeDetailModal();
        this.loadBikes();

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error actualizando moto:', error);

        this.isUpdatingBike = false;
        this.editBikeErrorMessage =
          error?.error || 'No se pudo actualizar la moto. Revisa los datos e intenta nuevamente.';

        this.cdr.detectChanges();
      },
    });
  }

  //* Method to close the modal edit bike
  closeEditBikeModal(): void {
    if (this.isUpdatingBike) return;

    this.showEditBikeModal = false;
    this.bikeToEdit = null;
    this.editBikeErrorMessage = '';
    this.editBikeFormSubmitted = false;

    this.editBikeErrors = {
      placa: '',
      marca: '',
      modelo: '',
    };

    this.editBikeForm = {
      placa: '',
      marca: '',
      modelo: '',
    };

    this.cdr.detectChanges();
  }

  //* Method to load the rol of the user
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
    } catch (error) {
      console.error('Error leyendo usuario desde localStorage:', error);
      this.rolUser = 'Sin rol';
      this.rolId = null;
    }
  }

  //* Method to parse and validate rol
  get isAdmin(): boolean {
    return Number(this.rolId) === 1;
  }

  //* Method to load services
  private loadBikeServices(bike: Bike): void {
    this.isLoadingBikeServices = true;
    this.bikeServicesErrorMessage = '';
    this.selectedBikeServices = [];

    this.servicesService.getServices().subscribe({
      next: (services) => {
        const bikeId = Number(bike.id);
        const bikePlate = (bike.placa || '').trim().toUpperCase();

        this.selectedBikeServices = services.filter((service) => {
          const serviceMotoId = Number(service.motoId);
          const servicePlate = (service.motoPlaca || '').trim().toUpperCase();

          return serviceMotoId === bikeId || servicePlate === bikePlate;
        });

        this.isLoadingBikeServices = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando servicios de la moto:', error);

        this.bikeServicesErrorMessage =
          'No se pudieron cargar los servicios realizados a esta moto.';

        this.isLoadingBikeServices = false;
        this.cdr.detectChanges();
      },
    });
  }

  //* Method for format the price of the service
  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  //* Method for validate placa for edit modal
  onEditBikePlacaInput(): void {
    this.editBikeForm.placa = this.editBikeForm.placa
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
  }

  //* Method for validate marca for edit modal
  onEditBikeMarcaInput(): void {
    this.editBikeForm.marca = this.capitalizeFirstLetter(this.editBikeForm.marca);
  }

  //* Method for group all validations before insert the edit bike
  private validateEditBikeForm(): typeof this.editBikeErrors {
    const errors = {
      placa: '',
      marca: '',
      modelo: '',
    };

    const placa = this.editBikeForm.placa.trim().toUpperCase();
    const marca = this.editBikeForm.marca.trim();
    const modelo = this.editBikeForm.modelo.trim();

    const placaRegex = /^[A-Z]{3}[0-9]{2}[A-Z0-9]$/;

    if (!placa) {
      errors.placa = 'La placa es obligatoria.';
    } else if (!placaRegex.test(placa)) {
      errors.placa = 'Ingresa una placa válida. Ej: ABC12D.';
    }

    if (!marca) {
      errors.marca = 'La marca es obligatoria.';
    }

    if (!modelo) {
      errors.modelo = 'El modelo es obligatorio.';
    }

    return errors;
  }
}
