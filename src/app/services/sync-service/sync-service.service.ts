import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, of } from 'rxjs';
import { UserProfile } from '../../models/user-profile';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth-service/auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private dbName = 'GameTrackerDB';
  private storeName = 'userProfile';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromIndexedDB(key: string): Promise<any> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async setInIndexedDB(key: string, value: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  getLocalProfile(): Observable<UserProfile | null> {
    return from(this.getFromIndexedDB('profile'));
  }

  getRemoteProfile(): Observable<UserProfile | null> {
    return this.http.get<UserProfile>(
      `${environment.apiUrl}/users/me/profile`,
      { withCredentials: true }
    );
  }

  saveProfile(profile: UserProfile): Observable<void> {
    return this.auth.isLoggedIn().pipe(
      switchMap((isLoggedIn) => {
        if (isLoggedIn) {
          return this.http.put<void>(
            `${environment.apiUrl}/users/me/profile`,
            profile,
            { withCredentials: true }
          );
        } else {
          return from(this.setInIndexedDB('profile', profile));
        }
      })
    );
  }

  saveToLocal(profile: UserProfile): Observable<void> {
    return from(this.setInIndexedDB('profile', profile));
  }
}
