import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RemindersService } from '../../../core/services/reminder.service';
import { Reminder } from '../../../core/interfaces/reminder.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-reminders',
  imports: [CommonModule],
  templateUrl: './dashboard-reminders.html',
  styleUrl: './dashboard-reminders.scss',
})
export class DashboardReminders {
  private reminderService = inject(RemindersService);
  private cdr = inject(ChangeDetectorRef);

  reminders: Reminder[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadReminders();
  }

  loadReminders(): void {
    this.isLoading = true;

    this.reminderService.getReminders().subscribe({
      next: (data) => {
        this.reminders = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error cargando recordatorios';
        this.isLoading = false;
      },
    });
  }

  get pendientes(): number {
    return this.reminders.filter(r => r.estado === 'PENDIENTE').length;
  }

  get enviados(): number {
    return this.reminders.filter(r => r.estado === 'ENVIADO').length;
  }

  esVencido(fecha: string): boolean {
    return new Date(fecha) < new Date();
  }

  enviarWhatsApp(reminder: Reminder) {
    console.log('Enviar WhatsApp a', reminder.telefono);
  }

  enviarCorreo(reminder: Reminder) {
    console.log('Enviar correo a', reminder.correo);
  }
}
