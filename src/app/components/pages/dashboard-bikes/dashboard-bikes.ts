import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bike } from '../../../core/interfaces/bike.interface';
import { BikesService } from '../../../core/services/bikes.service';
import { Customer } from '../../../core/interfaces/customer.interface';
import { Exportdataexcel, ExportModalStatus } from '../../shared/exportdataexcel/exportdataexcel';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dashboard-bikes',
  imports: [Exportdataexcel],
  templateUrl: './dashboard-bikes.html',
  styleUrl: './dashboard-bikes.scss',
})
export class DashboardBikes implements OnInit {

  private bikeService = inject(BikesService);
  private cdr = inject(ChangeDetectorRef);

  bikes: Bike[] = [];
  isLoading = true;
  errorMessage = '';

  //* Variables to excel
  showExportBikesModal = false;
  exportBikesStatus: ExportModalStatus = 'confirm';
  exportSuccessMessage = '';
  exportErrorMessage = '';

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

}
