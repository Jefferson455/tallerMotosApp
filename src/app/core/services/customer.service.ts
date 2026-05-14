import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Customer, updateCustomerRequest } from '../interfaces/customer.interface';
import { Observable } from 'rxjs';
import { env } from '../../../env/env';

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
  private apiUrl = env.apiUrl;

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

    return this.http.get<Customer[]>(`${this.apiUrl}/Clientes/Motos`, { headers });
  }

  crearClienteConMotos(payload: ClienteMotoCreateRequest): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/Clientes/Motos`, payload, { headers });
  }

  updateCustomer(id: number, payload: updateCustomerRequest): Observable<string> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put(`${this.apiUrl}/Clientes/${id}`, payload, {
      headers,
      responseType: 'text',
    });
  }

  deleteCustomer(id: number): Observable<string> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${this.apiUrl}/Clientes/${id}`, {
      headers,
      responseType: 'text',
    });
  }
}
