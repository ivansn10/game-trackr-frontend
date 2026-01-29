import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { GameModalComponent } from '../game-modal/game-modal.component';
import { Game } from '../../models/game';
import { GameSearchFilters } from '../../models/search-filters';
import { GameService } from '../../services/game-service/game-service.service';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemCardComponent, GameModalComponent],
  templateUrl: './search-modal.component.html',
})
export class SearchModalComponent implements OnInit, OnChanges {
  @Input() games: Game[] = [];
  @Input() initialFilters: GameSearchFilters | null = null;
  @Input() enablePagination: boolean = false;
  @Output() close = new EventEmitter<void>();

  filteredGames: Game[] = [];
  allGames: Game[] = [];
  selectedGame: Game | null = null;
  showGameModal = false;
  currentFilters: GameSearchFilters = {};

  selectedGenre = 'Any';
  selectedPlatform = 'Any';
  name = '';
  releaseFrom = '';
  releaseTo = '';

  genres: string[] = [];
  platforms: string[] = [];

  offset = 30;
  limit = 30;
  isLoading = false;
  hasMore = true;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.allGames = [...this.games];
    this.filteredGames = [...this.games];
    this.offset = this.games.length;

    this.gameService.getGenres().subscribe({
      next: (g) => (this.genres = g ?? []),
      error: (err) => console.error('Error loading genres', err),
    });

    this.gameService.getPlatforms().subscribe({
      next: (p) => (this.platforms = p ?? []),
      error: (err) => console.error('Error loading platforms', err),
    });

    if (this.initialFilters) {
      this.name = this.initialFilters.search ?? '';
      this.selectedGenre = this.initialFilters.genre ?? 'Any';
      this.selectedPlatform = this.initialFilters.platform ?? 'Any';
      this.releaseFrom = this.initialFilters.releaseFrom ?? '';
      this.releaseTo = this.initialFilters.releaseTo ?? '';

      this.currentFilters = { ...this.initialFilters };
    } else {
      this.currentFilters = {};
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters'] && this.initialFilters) {
      this.name = this.initialFilters.search ?? '';
      this.selectedGenre = this.initialFilters.genre ?? 'Any';
      this.selectedPlatform = this.initialFilters.platform ?? 'Any';
      this.releaseFrom = this.initialFilters.releaseFrom ?? '';
      this.releaseTo = this.initialFilters.releaseTo ?? '';

      setTimeout(() => {
        this.releaseFrom = this.initialFilters?.releaseFrom ?? '';
        this.releaseTo = this.initialFilters?.releaseTo ?? '';
      });
    }
  }

  applyFilters() {
    const filters: GameSearchFilters = {
      search: this.name || undefined,
      genre: this.selectedGenre !== 'Any' ? this.selectedGenre : undefined,
      platform:
        this.selectedPlatform !== 'Any' ? this.selectedPlatform : undefined,
      releaseFrom: this.releaseFrom
        ? Math.floor(new Date(this.releaseFrom).getTime() / 1000).toString()
        : undefined,
      releaseTo: this.releaseTo
        ? Math.floor(new Date(this.releaseTo).getTime() / 1000).toString()
        : undefined,
    };

    this.offset = 0;
    this.hasMore = true;
    this.isLoading = true;

    if (this.enablePagination) {
      this.gameService.searchGames(filters, this.limit, this.offset).subscribe({
        next: (results) => {
          this.allGames = [...results];
          this.filteredGames = [...results];
          this.offset += this.limit;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error applying filters', err);
          this.filteredGames = [];
          this.isLoading = false;
        },
      });
    } else {
      this.filteredGames = this.allGames.filter((g) => {
        const matchesName =
          !this.name ||
          g.gameTitle.toLowerCase().includes(this.name.toLowerCase());
        const matchesGenre =
          this.selectedGenre === 'Any' || g.genres.includes(this.selectedGenre);
        const matchesPlatform =
          this.selectedPlatform === 'Any' ||
          g.platforms.includes(this.selectedPlatform);
        const matchesDate =
          (!this.releaseFrom ||
            new Date(g.releaseDate) >= new Date(this.releaseFrom)) &&
          (!this.releaseTo ||
            new Date(g.releaseDate) <= new Date(this.releaseTo));

        return matchesName && matchesGenre && matchesPlatform && matchesDate;
      });

      this.isLoading = false;
    }
  }

  onDivScroll(event: Event): void {
    const target = event.target as HTMLElement;

    if (
      !this.enablePagination ||
      this.isLoading ||
      !this.hasMore ||
      target.scrollTop + target.clientHeight < target.scrollHeight - 200
    ) {
      return;
    }

    this.loadMoreGames();
  }

  loadMoreGames() {
    if (!this.enablePagination) return;
    this.isLoading = true;

    const filters: GameSearchFilters = {
      search: this.name || undefined,
      genre: this.selectedGenre !== 'Any' ? this.selectedGenre : undefined,
      platform:
        this.selectedPlatform !== 'Any' ? this.selectedPlatform : undefined,
      releaseFrom: this.releaseFrom
        ? Math.floor(new Date(this.releaseFrom).getTime() / 1000).toString()
        : undefined,
      releaseTo: this.releaseTo
        ? Math.floor(new Date(this.releaseTo).getTime() / 1000).toString()
        : undefined,
    };

    this.currentFilters = filters;

    this.gameService.searchGames(filters, this.limit, this.offset).subscribe({
      next: (results) => {
        if (results.length === 0) {
          this.hasMore = false;
        } else {
          this.allGames.push(...results);
          this.filteredGames.push(...results);
          this.offset += this.limit;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading more games:', err);
        this.isLoading = false;
        this.hasMore = false;
      },
    });
  }

  openGameModal(game: Game) {
    this.selectedGame = game;
    this.showGameModal = true;
  }

  closeGameModal() {
    this.selectedGame = null;
    this.showGameModal = false;
  }

  clearFilters() {
    this.selectedGenre = 'Any';
    this.selectedPlatform = 'Any';
    this.name = '';
    this.releaseFrom = '';
    this.releaseTo = '';
    this.applyFilters();
  }

  handleClose() {
    this.close.emit();
  }
}
