import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../interfaces/service.interface';
import { env } from '../../../env/env';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  getServices(): Observable<Service[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Service[]>(`${this.apiUrl}/Servicios`, { headers });
  }
}
