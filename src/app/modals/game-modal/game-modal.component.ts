import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarIconComponent } from '../../components/star-icon/star-icon.component';
import { Game, GameStatus } from '../../models/game';
import { UserProfileService } from '../../services/user-profile/user-profile.service';

@Component({
  selector: 'app-game-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, StarIconComponent],
  templateUrl: './game-modal.component.html',
})
export class GameModalComponent implements OnInit {
  @Input() game!: Game;
  @Output() close = new EventEmitter<void>();

  hoveredRating: number = 0;

  statuses: GameStatus[] = [
    'None',
    'Wishlist',
    'Owned',
    'Playing',
    'Completed',
    'Abandoned',
  ];

  constructor(private profileService: UserProfileService) {}

  ngOnInit(): void {
    if (!this.game.status) {
      this.game.status = 'None';
    }

    this.game.genres = Array.isArray(this.game.genres)
      ? this.game.genres
      : (this.game.genres as any)?.$values ?? [];

    this.game.platforms = Array.isArray(this.game.platforms)
      ? this.game.platforms
      : (this.game.platforms as any)?.$values ?? [];
  }

  setRating(score: number | null) {
    this.game.score = score;

    if (this.isEmptyEntry()) {
      this.profileService.removeGameEntry(this.game.gameId);
    } else {
      this.profileService.updateGameEntry({ ...this.game });
    }
  }

  onStatusChange(newStatus: string) {
    this.game.status = newStatus as GameStatus;

    if (this.isEmptyEntry()) {
      this.profileService.removeGameEntry(this.game.gameId);
    } else {
      this.profileService.updateGameEntry({ ...this.game });
    }
  }

  setHoverFromMouse(event: MouseEvent, star: number) {
    const { left, width } = (
      event.target as HTMLElement
    ).getBoundingClientRect();
    const hoverX = event.clientX - left;
    const isHalf = hoverX < width / 2;
    this.hoveredRating = isHalf ? star - 0.5 : star;
  }

  private isEmptyEntry(): boolean {
    return (
      (this.game.score == null || this.game.score === 0) &&
      this.game.status === 'None'
    );
  }

  setRatingByMouse(event: MouseEvent, star: number) {
    const { left, width } = (
      event.target as HTMLElement
    ).getBoundingClientRect();
    const clickX = event.clientX - left;
    const isHalf = clickX < width / 2;
    const clickedScore = isHalf ? star - 0.5 : star;

    // Si el usuario hace clic en la misma puntuación -> quitarla
    if (this.game.score === clickedScore) {
      this.hoveredRating = 0; // fuerza recalculo
      this.setRating(null);
    } else {
      this.setRating(clickedScore);
    }
  }

  clearHover() {
    this.hoveredRating = 0;
  }

  getStarFillPercentage(star: number): number {
    const effectiveRating = this.hoveredRating || this.game.score || 0;
    if (effectiveRating >= star) return 100;
    if (effectiveRating + 0.5 >= star) return 50;
    return 0;
  }
}
