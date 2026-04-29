import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Customer } from '../interfaces/customer.interface';
import { Observable } from 'rxjs';

export interface MotoCreateRequest {
  marca: string;
  modelo: string;
  placa: string;
}

export interface ClienteMotoCreateRequest {
  nombre: string;
  telefono: string;
  correo: string;
  documento: string;
  tipoDocumento: number;
  motos: MotoCreateRequest[];
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = 'https://tallermotosapi.somee.com/api/clientes';

  getClientes(): Observable<Customer[]> {
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Customer[]>(this.apiUrl, { headers });
  }

  getCustomersBikes(): Observable<Customer[]> {
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Customer[]>(`${this.apiUrl}/Motos`, { headers });
  }

  crearClienteConMotos(payload: ClienteMotoCreateRequest): Observable<any> {
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/Motos`, payload, { headers });
  }
}
