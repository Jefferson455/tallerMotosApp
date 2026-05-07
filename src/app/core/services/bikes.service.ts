import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bike } from '../interfaces/bike.interface';

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
}
