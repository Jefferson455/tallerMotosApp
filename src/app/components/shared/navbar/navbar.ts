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

  onServicesClick(): void {
    this.servicesClick.emit();
  }
  onAboutClick(): void {
    this.aboutClick.emit();
  }

}
