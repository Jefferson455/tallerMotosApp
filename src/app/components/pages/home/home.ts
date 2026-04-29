import { Component } from '@angular/core';
import { Navbar } from "../../shared/navbar/navbar";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [Navbar, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  isServicesModalOpen = false;
  isAboutModalOpen = false;
  isContactModalOpen = false;
  isFormServiceModalOpen = false;

  activeServiceIndex: number | null = null;

  serviceRequestForm = {
    nombre: '',
    telefono: '',
    correo: '',
    marca: '',
    modelo: '',
    placa: '',
    tipoServicio: '',
    descripcion: '',
  };

  openServicesModal(): void {
    this.isServicesModalOpen = true;
  }

  closeServiceModal(): void {
    this.isServicesModalOpen = false;
  }
  toggleService(index: number): void {
    this.activeServiceIndex = this.activeServiceIndex === index ? null : index;
  }
  openAboutModal(): void {
    this.isAboutModalOpen = true;
  }

  closeAboutModal(): void {
    this.isAboutModalOpen = false;
  }
  openContactModal(): void {
    this.isContactModalOpen = true;
  }

  closeContactModal(): void {
    this.isContactModalOpen = false;
  }

  openFormServiceModal(): void {
    this.isFormServiceModalOpen = true;
  }

  closeFormServiceModal(): void {
    this.isFormServiceModalOpen = false;
  }

  saveServiceRequestMock(): void {
    console.log('Solicitud de servicio:', this.serviceRequestForm);
    this.closeFormServiceModal();
  }
}
