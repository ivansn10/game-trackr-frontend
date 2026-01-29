import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemCardComponent } from '../item-card/item-card.component';
import { GameModalComponent } from '../../modals/game-modal/game-modal.component';
import { SearchModalComponent } from '../../modals/search-modal/search-modal.component';
import { AiModalComponent } from '../../modals/ai-modal/ai-modal.component';
import { Game, GameStatus } from '../../models/game';
import { UserProfileService } from '../../services/user-profile/user-profile.service';
import { GameSearchFilters } from '../../models/search-filters';
import { UserProfile } from '../../models/user-profile';
import { Recommendation } from '../../models/recommendation';
import { GameService } from '../../services/game-service/game-service.service';

@Component({
  selector: 'app-item-section',
  standalone: true,
  imports: [
    CommonModule,
    ItemCardComponent,
    GameModalComponent,
    SearchModalComponent,
    AiModalComponent,
  ],
  templateUrl: './item-section.component.html',
})
export class ItemSectionComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() games: Game[] = [];
  @Input() source: 'profile' | 'remote' = 'remote';
  @Input() status?: GameStatus | 'collection';
  @Input() modalType: 'game' | 'ai' = 'game';
  @Input() maxVisible: number | null = null;
  @Input() initialFilters: GameSearchFilters | null = null;

  recommendation: Recommendation | null = null;
  visibleGames: Game[] = [];
  allGames: Game[] = [];
  selectedGame: Game | null = null;
  selectedRecommendation: Recommendation | null = null;
  showModal = false;
  showSearchModal = false;
  isLoading = false;
  isRecommendationLoading = false;

  constructor(
    private profileService: UserProfileService,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    if (this.modalType === 'ai') {
      const cached = this.gameService.getRecommendedCache();
      if (cached) {
        this.recommendation = cached;
        this.visibleGames = [cached.game];
        this.allGames = [cached.game];
      } else {
        this.requestNewRecommendation();
      }
    }

    if (this.source === 'profile') {
      this.isLoading = true;
      this.profileService.userProfile$.subscribe((profile) => {
        if (profile) {
          this.loadFromProfile(profile);
        } else {
          this.allGames = [];
          this.visibleGames = [];
          this.isLoading = false;
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.source === 'remote' && changes['games']) {
      const newGames: Game[] = changes['games'].currentValue;
      if (!newGames || newGames.length === 0) {
        this.isLoading = true;
        this.allGames = [];
        this.visibleGames = [];
        return;
      }
      this.isLoading = false;
      this.allGames = [...newGames];
      this.pickVisibleGames();
    }
  }

  get subtitle(): string | null {
    if (this.source === 'remote') return null;
    return `${this.allGames.length} game${
      this.allGames.length === 1 ? '' : 's'
    }`;
  }

  get loadingSlots(): number[] {
    const count = this.maxVisible ?? 3;
    return Array.from({ length: count }, (_, i) => i);
  }

  private loadFromProfile(profile: UserProfile) {
    const all = profile.gameCollection;
    this.allGames =
      this.status === 'collection'
        ? all.filter((g) => g.score != null || g.status !== 'None')
        : this.status
        ? all.filter((g) => g.status === this.status)
        : all;

    this.pickVisibleGames();
    this.isLoading = false;
  }

  pickVisibleGames() {
    const count = this.maxVisible ?? 3;
    const shuffled = [...this.allGames]
      .map((g) => ({ g, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ g }) => g)
      .slice(0, count);

    this.visibleGames = shuffled;
  }

  openGameModal(game: Game) {
    this.selectedRecommendation = null;
    this.selectedGame = game;
    this.showModal = true;
  }

  openAiModal() {
    if (!this.recommendation?.game) return;
    this.selectedRecommendation = this.recommendation;
    this.selectedGame = this.recommendation.game;
    this.showModal = true;
  }

  handleTitleClick() {
    if (this.modalType === 'ai' && this.recommendation?.game) {
      this.openAiModal();
    } else if (this.modalType === 'game') {
      this.openSearchModal();
    }
  }

  requestNewRecommendation() {
    this.isRecommendationLoading = true;
    this.visibleGames = [{} as Game];

    this.gameService.getRecommendedGame(true).subscribe({
      next: (rec) => {
        this.recommendation = rec;
        this.visibleGames = [rec.game];
        this.allGames = [rec.game];
        this.isRecommendationLoading = false;
      },
      error: (err) => {
        console.error('Error loading recommendation', err);
        this.isRecommendationLoading = false;
      },
    });
  }

  closeGameModal() {
    this.selectedGame = null;
    this.selectedRecommendation = null;
    this.showModal = false;
  }

  openSearchModal() {
    if (this.allGames.length <= 1) return;
    this.showSearchModal = true;
  }

  closeSearchModal() {
    this.showSearchModal = false;
  }
}
