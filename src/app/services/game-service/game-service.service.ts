import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { filter, forkJoin, map, Observable, of, take, tap } from 'rxjs';
import { Game } from '../../models/game';
import { environment } from '../../../environments/environment';
import { GameSearchFilters } from '../../models/search-filters';
import { Recommendation } from '../../models/recommendation';
import { UserProfileService } from '../user-profile/user-profile.service';
import { UserProfile } from '../../models/user-profile';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly API_URL = `${environment.apiUrl}/igdb`;

  constructor(
    private http: HttpClient,
    private userProfileService: UserProfileService
  ) {}

  private allGamesCache: Game[] | null = null;
  private recentGamesCache: Game[] | null = null;
  private comingGamesCache: Game[] | null = null;
  private recommendedGameCache: Recommendation | null = null;

  getGameById(gameId: number): Observable<Game> {
    return this.http.get<any>(`${this.API_URL}/game/${gameId}`).pipe(
      map((response) => ({
        gameId, // ID local de nuestra app
        igdbId: gameId, // Asumimos que es el mismo si no viene explícitamente
        gameTitle: response.name,
        imageUrl: response.coverUrl,
        releaseDate: response.releaseDate,
        platforms: response.platforms,
        genres: response.genres,
        score: null, // no viene en el JSON, así que lo dejamos como null
        description: response.summary,
      }))
    );
  }

  searchGames(
    filters: GameSearchFilters,
    limit: number = 30,
    offset: number = 0
  ): Observable<Game[]> {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);
    if (filters.genre) params = params.set('genre', filters.genre);
    if (filters.platform) params = params.set('platform', filters.platform);
    if (filters.releaseFrom) params = params.set('releaseFrom', filters.releaseFrom);
    if (filters.releaseTo) params = params.set('releaseTo', filters.releaseTo);

    params = params.set('limit', limit.toString());
    params = params.set('offset', offset.toString());

    return forkJoin({
      games: this.http.get<any[]>(`${this.API_URL}/search`, { params }),
      profile: this.userProfileService.userProfile$.pipe(
        filter((p): p is UserProfile => p !== null),
        take(1)
      ),
    }).pipe(
      map(({ games, profile }) => {
        const collection = profile?.gameCollection ?? [];

        return games.map((g) => {
          const match = collection.find((cg) => cg.igdbId === g.igdbId);

          return {
            gameId: g.gameId,
            igdbId: g.igdbId,
            gameTitle: g.gameTitle,
            description: g.description,
            imageUrl: g.imageUrl,
            releaseDate: g.releaseDate,
            genres: g.genres || [],
            platforms: g.platforms || [],
            score: match?.score ?? null,
            status: match?.status ?? 'None',
          };
        });
      })
    );
  }

  getGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/genres`);
  }

  getPlatforms(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/platforms`);
  }

  getAllGames(): Observable<Game[]> {
    if (this.allGamesCache) return of(this.allGamesCache);

    return this.searchGames({}, 30).pipe(
      tap((games) => (this.allGamesCache = games))
    );
  }

  getRecentGames(): Observable<Game[]> {
    if (this.recentGamesCache) return of(this.recentGamesCache);

    const { from, to } = this.getRecentRange();
    return this.searchGames({ releaseFrom: from, releaseTo: to }, 30).pipe(
      tap((games) => (this.recentGamesCache = games))
    );
  }

  getComingGames(): Observable<Game[]> {
    if (this.comingGamesCache) return of(this.comingGamesCache);

    const { from, to } = this.getComingRange();
    return this.searchGames({ releaseFrom: from, releaseTo: to }, 30).pipe(
      tap((games) => (this.comingGamesCache = games))
    );
  }

  getRecentRange(): { from: string; to: string } {
    const to = Math.floor(new Date().getTime() / 1000); // hoy
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 1);
    const from = Math.floor(fromDate.getTime() / 1000);
    return { from: from.toString(), to: to.toString() };
  }

  getComingRange(): { from: string; to: string } {
    const from = Math.floor(new Date().getTime() / 1000); // hoy
    const toDate = new Date();
    toDate.setMonth(toDate.getMonth() + 1);
    const to = Math.floor(toDate.getTime() / 1000);
    return { from: from.toString(), to: to.toString() };
  }

  getRecommendedGame(forceRefresh = false): Observable<Recommendation> {
    if (!forceRefresh && this.recommendedGameCache) {
      return of(this.recommendedGameCache);
    }

    return this.http
      .get<Recommendation>(`${environment.apiUrl}/weaviate/recommendations`, {
        withCredentials: true,
      })
      .pipe(
        tap((rec) => {
          this.recommendedGameCache = rec;
        })
      );
  }

  getRecentDate(): string {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    return pastDate.toISOString().split('T')[0];
  }

  getComingDate(): string {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    return futureDate.toISOString().split('T')[0];
  }

  getAllGamesCache(): Game[] {
    return this.allGamesCache ?? [];
  }

  getRecentGamesCache(): Game[] {
    return this.recentGamesCache ?? [];
  }

  getComingGamesCache(): Game[] {
    return this.comingGamesCache ?? [];
  }

  getRecommendedCache(): Recommendation | null {
    return this.recommendedGameCache ?? null;
  }
}
