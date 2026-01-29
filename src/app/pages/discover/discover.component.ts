import { Component, OnInit } from '@angular/core';
import { Game } from '../../models/game';
import { GameService } from '../../services/game-service/game-service.service';
import { ItemSectionComponent } from '../../components/item-section/item-section.component';
import { Recommendation } from '../../models/recommendation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, ItemSectionComponent],
  templateUrl: './discover.component.html',
})
export class DiscoverComponent implements OnInit {
  allGames: Game[] = [];
  recentGames: Game[] = [];
  comingGames: Game[] = [];
  recommended: Recommendation | null = null;

  comingDate!: string;
  recentDate!: string;

  today = new Date().toISOString().split('T')[0];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.comingDate = this.gameService.getComingDate();
    this.recentDate = this.gameService.getRecentDate();

    this.allGames = this.gameService.getAllGamesCache();
    if (!this.allGames.length) {
      this.gameService.getAllGames().subscribe((games) => {
        this.allGames = games;
      });
    }

    this.recentGames = this.gameService.getRecentGamesCache();
    if (!this.recentGames.length) {
      this.gameService.getRecentGames().subscribe((games) => {
        this.recentGames = games;
      });
    }

    this.comingGames = this.gameService.getComingGamesCache();
    if (!this.comingGames.length) {
      this.gameService.getComingGames().subscribe((games) => {
        this.comingGames = games;
      });
    }

    this.recommended = this.gameService.getRecommendedCache();
    if (!this.recommended) {
      this.gameService.getRecommendedGame().subscribe((rec) => {
        this.recommended = rec;
      });
    }
  }
}