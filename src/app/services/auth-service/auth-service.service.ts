import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkAuthStatus().subscribe();
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  private checkAuthStatus(): Observable<boolean> {
    return this.http
      .get<{ userId?: number; username?: string }>(
        `${environment.apiUrl}/auth/status`,
        { withCredentials: true }
      )
      .pipe(
        map((res) => {
          const isLogged = !!res.userId;
          this.isLoggedInSubject.next(isLogged);
          return isLogged;
        }),
        catchError(() => {
          this.isLoggedInSubject.next(false);
          return of(false);
        })
      );
  }

  login(credentials: { username: string; password: string }): Observable<void> {
    return this.http
      .post<{ userId: number }>(
        `${environment.apiUrl}/auth/login`,
        credentials,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((res) => {
          this.isLoggedInSubject.next(true);
        }),
        map(() => undefined)
      );
  }

  register(data: { username: string; password: string }): Observable<void> {
    return this.http
      .post<{ userId: number }>(`${environment.apiUrl}/users`, {
        Username: data.username,
        Password: data.password,
      })
      .pipe(map(() => undefined));
  }

  logout(): void {
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.isLoggedInSubject.next(false);
        },
        error: () => {
          this.isLoggedInSubject.next(false);
        },
      });
  }

  deleteCurrentUser(): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/users/me`, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.isLoggedInSubject.next(false);
        })
      );
  }
}
