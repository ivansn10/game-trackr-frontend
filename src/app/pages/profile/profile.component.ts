import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountModalComponent } from '../../modals/account-modal/account-modal.component';
import { DataManagementModalComponent } from '../../modals/data-management-modal/data-management-modal.component';
import { ProfileManagementModalComponent } from '../../modals/profile-management-modal/profile-management-modal.component';
import { ConflictResolutionModalComponent } from '../../modals/conflict-resolution-modal/conflict-resolution-modal.component';
import { UserProfileService } from '../../services/user-profile/user-profile.service';
import { AuthService } from '../../services/auth-service/auth-service.service';
import { SyncService } from '../../services/sync-service/sync-service.service';
import { Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile';
import { Game } from '../../models/game';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccountModalComponent,
    DataManagementModalComponent,
    ProfileManagementModalComponent,
    ConflictResolutionModalComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  user$: Observable<UserProfile | null>;
  isLoggedIn$: Observable<boolean>;

  showAuthModal = false;
  isSignupMode = false;

  showDataModal = false;
  dataModalMode: 'export' | 'import' | 'delete' = 'export';

  showProfileModal = false;
  profileModalMode: 'avatar' | 'name' = 'avatar';

  showConflictModal = false;
  localProfile: UserProfile | null = null;
  remoteProfile: UserProfile | null = null;

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private syncService: SyncService
  ) {
    this.user$ = this.userProfileService.userProfile$;
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  openAuthModal(mode: 'login' | 'signup') {
    this.isSignupMode = mode === 'signup';
    this.showAuthModal = true;
  }

  closeAuthModal(reason: 'login' | 'signup' | 'cancel') {
    this.showAuthModal = false; // ✅ cerrar siempre

    if (reason === 'login') {
      this.userProfileService.clear();
      this.userProfileService.loadProfile().subscribe(() => {
        this.userProfileService.syncAfterLoginOnce(() => this.syncNow());
      });
    }
  }

  openDataModal(mode: 'export' | 'import' | 'delete') {
    this.dataModalMode = mode;
    this.showDataModal = true;
  }

  closeDataModal() {
    this.showDataModal = false;
  }

  openProfileModal(mode: 'avatar' | 'name') {
    this.profileModalMode = mode;
    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  handleLogout() {
    console.log('[LOGOUT] Cerrando sesión...');

    const profile = this.userProfileService.current;
    if (profile) {
      this.syncService.saveToLocal(profile).subscribe(() => {
        console.log('[LOGOUT] Perfil guardado como local');

        this.userProfileService.clear(); // 🔒 ahora sí, limpia memoria
        this.authService.logout(); // 🔐 termina sesión

        // recargar el perfil local para usarlo en modo offline
        this.userProfileService.loadProfile().subscribe((local) => {
          console.log('[LOGOUT] Perfil recargado desde IndexedDB:', local);
        });
      });
    } else {
      // sin perfil actual: hacer logout directamente
      this.userProfileService.clear();
      this.authService.logout();
      this.userProfileService.loadProfile().subscribe((local) => {
        console.log('[LOGOUT] Perfil recargado desde IndexedDB:', local);
      });
    }
  }

  handleDeleteAccount() {
    this.authService.deleteCurrentUser().subscribe({
      next: () => {},
      error: (err) => {
        console.error('Error deleting account:', err);
      },
    });
  }

  syncNow() {
    console.log('[SYNC] syncNow() CALLED');

    this.syncService.getLocalProfile().subscribe((local) => {
      if (!local) return;

      this.authService.isLoggedIn().subscribe((loggedIn) => {
        if (!loggedIn) return;

        this.syncService.getRemoteProfile().subscribe({
          next: (remote) => {
            if (!remote) return;

            const isEqual = this.areProfilesEqual(local, remote);
            console.log('local', local);
            console.log('remote', remote);
            console.log('isEqual', isEqual);

            if (isEqual) {
              this.userProfileService.updateProfile(local, true); // guarda en todo
              this.userProfileService.allowRemoteWrites(); // activa sync automático
            } else {
              this.localProfile = local;
              this.remoteProfile = remote;
              this.showConflictModal = true;
            }
          },
          error: () => console.error('Error fetching remote profile'),
        });
      });
    });
  }

  resolveConflict(option: 'local' | 'remote' | 'merge' | 'cancel') {
    this.showConflictModal = false;

    if (option === 'cancel') return;

    if (option === 'local' && this.localProfile) {
      this.syncService.saveProfile(this.localProfile).subscribe(() => {
        this.userProfileService.updateProfile(this.localProfile!, true);
        this.userProfileService.allowRemoteWrites(); // ✅ permitir sync después
      });
    }

    if (option === 'remote' && this.remoteProfile) {
      this.userProfileService.updateProfile(this.remoteProfile, true);
      this.userProfileService.allowRemoteWrites(); // ✅ permitir sync después
    }

    if (option === 'merge' && this.localProfile && this.remoteProfile) {
      const merged = this.mergeProfiles(this.localProfile, this.remoteProfile);
      this.syncService.saveProfile(merged).subscribe(() => {
        this.userProfileService.updateProfile(merged, true);
        this.userProfileService.allowRemoteWrites(); // ✅ permitir sync después
      });
    }

    this.localProfile = null;
    this.remoteProfile = null;
  }

  private mergeProfiles(local: UserProfile, remote: UserProfile): UserProfile {
    const allGames = [...local.gameCollection, ...remote.gameCollection];
    const uniqueGames = this.deduplicateGames(allGames);

    // 🔍 Debug logs
    console.log('[MERGE] Local count:', local.gameCollection.length);
    console.log('[MERGE] Remote count:', remote.gameCollection.length);
    console.log('[MERGE] Merged unique count:', uniqueGames.length);

    return {
      displayName: local.displayName,
      avatarUrl: local.avatarUrl,
      createdAt: new Date().toISOString(),
      gameCollection: uniqueGames,
    };
  }

  private deduplicateGames(games: Game[]): Game[] {
    const seen = new Set<string>();

    return games.filter((game) => {
      // Usa igdbId como clave principal, si no existe, usa gameTitle como fallback
      const key = game.igdbId
        ? String(game.igdbId)
        : game.gameTitle.trim().toLowerCase();

      if (seen.has(key)) {
        return false; // duplicado
      }

      seen.add(key);
      return true; // nuevo
    });
  }

  private areProfilesEqual(p1: UserProfile, p2: UserProfile): boolean {
    if (p1.displayName !== p2.displayName) return false;
    if (p1.avatarUrl !== p2.avatarUrl) return false;

    const a = p1.gameCollection ?? [];
    const b = p2.gameCollection ?? [];

    if (a.length !== b.length) return false;

    const normalize = (val: any) => val?.toString().trim().toLowerCase() ?? '';

    const simplify = (game: Game) => ({
      igdbId: game.igdbId,
      gameTitle: normalize(game.gameTitle),
      status: normalize(game.status),
      score: game.score ?? null,
      genres: [...(game.genres ?? [])].map(normalize).sort(),
      platforms: [...(game.platforms ?? [])].map(normalize).sort(),
    });

    const simplifiedA = a.map(simplify).sort((x, y) => x.igdbId - y.igdbId);
    const simplifiedB = b.map(simplify).sort((x, y) => x.igdbId - y.igdbId);

    for (let i = 0; i < simplifiedA.length; i++) {
      const ga = simplifiedA[i];
      const gb = simplifiedB[i];

      if (
        ga.igdbId !== gb.igdbId ||
        ga.gameTitle !== gb.gameTitle ||
        ga.status !== gb.status ||
        ga.score !== gb.score ||
        JSON.stringify(ga.genres) !== JSON.stringify(gb.genres) ||
        JSON.stringify(ga.platforms) !== JSON.stringify(gb.platforms)
      ) {
        return false;
      }
    }

    return true;
  }
}
