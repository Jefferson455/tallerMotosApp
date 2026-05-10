import { Component, ChangeDetectorRef, EventEmitter, Input, Output, inject } from '@angular/core';

export type ExportModalStatus = 'idle' | 'confirm' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-exportdataexcel',
  imports: [],
  templateUrl: './exportdataexcel.html',
  styleUrl: './exportdataexcel.scss',
})
export class Exportdataexcel {
  private cdr = inject(ChangeDetectorRef);

  @Input() show = false;

  @Input() title = '¿Exportar información?';
  @Input() successTitle = 'Excel generado correctamente';
  @Input() errorTitle = 'No se pudo exportar';

  @Input() itemName = 'registros';
  @Input() itemCount = 0;

  @Input() warningMessage = 'El archivo incluirá la información registrada en el sistema.';
  @Input() successMessage = 'La información fue exportada correctamente.';
  @Input() errorMessage = 'No se pudo generar el archivo Excel. Intenta nuevamente.';

  @Input() confirmButtonText = 'Sí, exportar';
  @Input() loadingButtonText = 'Exportando...';
  @Input() cancelButtonText = 'Cancelar';
  @Input() successButtonText = 'Perfecto';
  @Input() errorButtonText = 'Entendido';

  @Input() status: ExportModalStatus = 'confirm';

  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmExport = new EventEmitter<void>();


  get isLoading(): boolean {
    return this.status === 'loading';
  }

  get isSuccess(): boolean {
    return this.status === 'success';
  }

  get isError(): boolean {
    return this.status === 'error';
  }

  get isConfirm(): boolean {
    return this.status === 'confirm' || this.status === 'idle';
  }

  onClose(): void {
    if (this.isLoading) return;

    this.closeModal.emit();
    this.cdr.detectChanges();
  }

  onConfirm(): void {
    if (this.isLoading) return;

    this.confirmExport.emit();
    this.cdr.detectChanges();
  }

}
