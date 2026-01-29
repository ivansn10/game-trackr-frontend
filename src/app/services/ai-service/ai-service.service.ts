import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recommendation } from '../../models/recommendation';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly API_URL = '/api/recommendations'; // Ajusta según tu backend

  constructor(private http: HttpClient) {}

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(this.API_URL);
  }
}
