import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Rol {
  id: number;
  nombre: string;
  usuarios: unknown[];
}
@Injectable({
  providedIn: 'root',
})
export class RolService {
  private http = inject(HttpClient);
  private apiUrl = 'https://tallermotosapi.somee.com/api/roles';

  getRoles(): Observable<Rol[]> {
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Rol[]>(this.apiUrl, { headers });
  }
}
