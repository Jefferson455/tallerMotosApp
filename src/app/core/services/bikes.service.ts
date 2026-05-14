import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bike, BikeCreateRequest, BikeUpdateRequest } from '../interfaces/bike.interface';
import { env } from '../../../env/env';

@Injectable({
  providedIn: 'root',
})
export class BikesService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  getBikes(): Observable<Bike[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Bike[]>(`${this.apiUrl}/Motos`, { headers });
  }

  createBike(payload: BikeCreateRequest): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(this.apiUrl, payload, { headers });
  }

  updateBike(id: number, payload: BikeUpdateRequest): Observable<string> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put(`${this.apiUrl}/Motos/${id}`, payload, {
      headers,
      responseType: 'text',
    });
  }

  deleteBike(id: number): Observable<string> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${this.apiUrl}/Motos/${id}`, {
      headers,
      responseType: 'text',
    });
  }
}
