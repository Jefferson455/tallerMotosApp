import { Component } from '@angular/core';
import { Navbar } from "../../shared/navbar/navbar";

@Component({
  selector: 'app-home',
  imports: [Navbar],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  isServicesModalOpen = false;
  isAboutModalOpen = false;
  isContactModalOpen = false;
  activeServiceIndex: number | null = null;

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

}
