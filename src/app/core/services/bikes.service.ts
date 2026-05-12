import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bike, BikeCreateRequest, BikeUpdateRequest } from '../interfaces/bike.interface';

@Injectable({
  providedIn: 'root',
})
export class BikesService {
  private http = inject(HttpClient);
  private apiUrl = 'https://tallermotosapi.somee.com/api/Motos';

  getBikes(): Observable<Bike[]> {
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Bike[]>(this.apiUrl, { headers });
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

    return this.http.put(`${this.apiUrl}/${id}`, payload, {
      headers,
      responseType: 'text',
    });
  }
}
