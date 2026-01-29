import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-card.component.html',
})
export class ItemCardComponent {
  @Input() game!: Game;
  @Output() gameClicked = new EventEmitter<Game>();
  @Input() loading: boolean = false;

  onClick(event: Event) {
    event.stopPropagation();
    this.gameClicked.emit(this.game);
  }
}
