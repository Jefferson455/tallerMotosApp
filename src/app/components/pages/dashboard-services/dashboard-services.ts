import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../../core/interfaces/service.interface';
import { CommonModule } from '@angular/common';
import { UsuarioStorage } from '../../../core/interfaces/customer.interface';
import { Exportdataexcel, ExportModalStatus } from '../../shared/exportdataexcel/exportdataexcel';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dashboard-services',
  imports: [Exportdataexcel, CommonModule],
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

  //* Variables to excel
  showExportServicesModal = false;
  exportServicesStatus: ExportModalStatus = 'confirm';
  exportSuccessMessage = '';
  exportErrorMessage = '';

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

  //* Method to export excel in pc
  private async exportServicesToExcel(): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Motos');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Moto Placa', key: 'placa', width: 18 },
      { header: 'Nombre tecnico', key: 'nameMechanic', width: 20 },
      { header: 'Descripción', key: 'description', width: 35 },
      { header: 'Kilometraje', key: 'km', width: 15 },
      { header: 'Costo', key: 'cost', width: 18 },
      { header: 'Fecha', key: 'serviceDate', width: 18 },
      { header: 'Estado', key: 'status', width: 14 },
    ];

    this.services.forEach((service) => {
      worksheet.addRow({
        id: service.id,
        placa: service.motoPlaca || 'No hay dato registrado',
        nameMechanic: service.nombreUsuario ?? 'N/A',
        description: service.descripcion || 'No hay dato registrado',
        km: service.kilometraje || 'No hay dato registrado',
        cost: service.costo || 'No hay dato registrado',
        serviceDate: service.fecha || 'No hay dato registrado',
        status: service.estado ?? 'N/A',
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

  //* Call the modal export to excel
  openExportServicesModal(): void {
    this.exportServicesStatus = 'confirm';
    this.exportSuccessMessage = '';
    this.exportErrorMessage = '';
    this.showExportServicesModal = true;
  }

  //* End the modal export in excel
  closeExportServicesModal(): void {
    this.showExportServicesModal = false;
    this.exportServicesStatus = 'confirm';
    this.exportSuccessMessage = '';
    this.exportErrorMessage = '';
  }

  //* Modal confirm to export excel
  confirmExportServices(): void {
    if (this.services.length === 0) {
      this.exportServicesStatus = 'error';
      this.exportErrorMessage = 'No hay motos registradas para exportar.';
      this.cdr.detectChanges();
      return;
    }

    this.exportServicesStatus = 'loading';
    this.cdr.detectChanges();

    setTimeout(() => {
      try {
        this.exportServicesToExcel();

        this.exportSuccessMessage = `Se exportaron ${this.services.length} motos correctamente.`;
        this.exportServicesStatus = 'success';
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error exportando motos:', error);

        this.exportErrorMessage = 'No se pudo generar el archivo Excel de motos.';
        this.exportServicesStatus = 'error';
        this.cdr.detectChanges();
      }
    }, 900);
  }
}
