import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Reminder } from "../interfaces/reminder.interface";
import { env } from "../../../env/env";

@Injectable({
  providedIn: 'root',
})
export class RemindersService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  getReminders(): Observable<Reminder[]> {
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Reminder[]>(this.apiUrl, { headers });
  }
}
