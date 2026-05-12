import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RolService, Rol } from '../../../core/services/rol.service';
import { Asidebar } from "../../shared/asidebar/asidebar";


@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})

export class Dashboard implements OnInit {

  rolUser = '';
  ngOnInit(): void {
    this.loadUserSession();
  }
  private loadUserSession(): void {
    const userStorage = localStorage.getItem('usuario');

    if (!userStorage) {
      this.rolUser = '';
      return;
    }

    const user = JSON.parse(userStorage);

    this.rolUser =
      user.rolNombre ||
      user.rol ||
      user.role ||
      user.nombreRol ||
      '';
  }
}
