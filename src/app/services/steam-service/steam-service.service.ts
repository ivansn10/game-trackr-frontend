import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SteamGame {
  appid: number;
  name: string;
  img_icon_url?: string;
  playtime_forever?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SteamService {
  private readonly API_BASE = '/api/steam';

  constructor(private http: HttpClient) {}

  loginWithSteam(): void {
    window.location.href = `${this.API_BASE}/login`;
  }

  getOwnedGames(steamId: string): Observable<SteamGame[]> {
    const params = new HttpParams().set('steamId', steamId);
    return this.http.get<SteamGame[]>(`${this.API_BASE}/games`, { params });
  }
}
