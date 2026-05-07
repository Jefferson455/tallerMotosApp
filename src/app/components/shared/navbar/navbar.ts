import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  @Output() servicesClick = new EventEmitter<void>();
  @Output() aboutClick = new EventEmitter<void>();
  @Output() contactClick = new EventEmitter<void>();

  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onServicesClick(): void {
    this.servicesClick.emit();
    this.closeMobileMenu();
  }

  onAboutClick(): void {
    this.aboutClick.emit();
    this.closeMobileMenu();
  }

  onContactClick(): void {
    this.contactClick.emit();
    this.closeMobileMenu();
  }
}
