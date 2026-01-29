import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { UserProfile } from '../../models/user-profile';
import { SyncService } from '../sync-service/sync-service.service';
import { Game } from '../../models/game';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  private allowRemoteSync = false; // 🔐 evita sincronización temprana
  private hasSyncedAfterLogin = false;

  constructor(private sync: SyncService) {}

  loadProfile(): Observable<UserProfile | null> {
    return this.sync.getLocalProfile().pipe(
      switchMap((profile) => {
        if (profile) {
          this.userProfileSubject.next(profile);
          return of(profile);
        }

        const resolved: UserProfile = {
          displayName: 'User',
          avatarUrl:
            'https://static-00.iconduck.com/assets.00/avatar-icon-2048x2048-ilrgk6vk.png',
          createdAt: new Date().toISOString(),
          gameCollection: [],
        };

        return this.sync.saveToLocal(resolved).pipe(
          tap(() => console.log('[LOAD] saved default profile to IndexedDB')),
          tap(() => this.userProfileSubject.next(resolved)),
          switchMap(() => of(resolved))
        );
      })
    );
  }

  syncAfterLoginOnce(callback: () => void) {
    if (this.hasSyncedAfterLogin) return;
    this.hasSyncedAfterLogin = true;
    callback();
  }

  lockAndSaveLocal(): void {
    const current = this.userProfileSubject.value;
    if (!current) return;

    this.allowRemoteSync = false; // 🔒 bloqueamos sync
    this.sync.saveToLocal(current).subscribe(() => {
      console.log('[USER PROFILE] Saved to local & locked sync');
    });
  }

  lockAndSaveRemote(profile: UserProfile): void {
    this.allowRemoteSync = false;
    this.userProfileSubject.next(profile);
    this.sync.saveToLocal(profile).subscribe(() => {
      console.log('[USER PROFILE] Remote saved locally and sync locked');
    });
  }

  get current(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  /**
   * Actualiza el perfil en memoria, lo guarda en backend (si persist y permitido),
   * y siempre lo guarda en IndexedDB.
   */
  updateProfile(profile: Partial<UserProfile>, persist: boolean = true) {
    if (!this.current) return;

    const updated = { ...this.current, ...profile } as UserProfile;

    // ✅ Evita emitir si no cambió nada
    if (JSON.stringify(this.current) === JSON.stringify(updated)) {
      console.log('[USER PROFILE] No changes detected. Skipping update.');
      return;
    }

    this.userProfileSubject.next(updated);

    if (persist && this.allowRemoteSync) {
      this.sync.saveProfile(updated).subscribe();
    }

    this.sync.saveToLocal(updated).subscribe();
  }
  /**
   * Actualiza solo memoria e IndexedDB. No toca el backend.
   */
  updateLocalOnly(profile: Partial<UserProfile>) {
    if (!this.current) return;

    const updated = { ...this.current, ...profile } as UserProfile;
    this.userProfileSubject.next(updated);
    this.sync.saveToLocal(updated).subscribe();
  }

  /**
   * Llama esto después de `syncNow()` para permitir sincronización real.
   */
  allowRemoteWrites() {
    console.log('[USER PROFILE] Remote writes enabled');
    this.allowRemoteSync = true;
  }

  clear() {
    this.userProfileSubject.next(null);
    this.allowRemoteSync = false;
  }

  applyProfileUpdate(update: UserProfile) {
    if ((this as any).allowRemoteSync === false) {
      this.updateLocalOnly(update);
    } else {
      this.updateProfile(update);
    }
  }

  updateGameEntry(updatedEntry: Game) {
    if (!this.current) return;

    const existing = this.current.gameCollection.find(
      (e) => e.gameId === updatedEntry.gameId
    );

    const updatedCollection = existing
      ? this.current.gameCollection.map((e) =>
          e.gameId === updatedEntry.gameId ? updatedEntry : e
        )
      : [...this.current.gameCollection, updatedEntry];

    const updatedProfile = {
      ...this.current,
      gameCollection: updatedCollection,
    };
    this.applyProfileUpdate(updatedProfile);
  }

  removeGameEntry(gameId: number) {
    if (!this.current) return;

    const filtered = this.current.gameCollection.filter(
      (g) => g.gameId !== gameId
    );

    const updatedProfile = { ...this.current, gameCollection: filtered };
    this.applyProfileUpdate(updatedProfile);
  }
}
