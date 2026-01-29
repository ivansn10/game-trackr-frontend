import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { GameModalComponent } from '../game-modal/game-modal.component';
import { Recommendation } from '../../models/recommendation';
import { Game } from '../../models/game';

@Component({
  selector: 'app-ai-modal',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, GameModalComponent],
  templateUrl: './ai-modal.component.html',
})
export class AiModalComponent {
  @Input() recommendation!: Recommendation;
  @Input() loading: boolean = false;

  @Output() requestNew = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  showGameModal = false;

  get game(): Game {
    return this.recommendation.game;
  }

  openGameModal() {
    this.showGameModal = true;
  }

  closeGameModal() {
    this.showGameModal = false;
  }

  requestNewRecommendation() {
    this.requestNew.emit();
  }
}
