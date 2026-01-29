import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UserProfileService } from './services/user-profile/user-profile.service';
import { GameService } from './services/game-service/game-service.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  standalone: true,
})
export class AppComponent {
  title = 'game-tracker';

  constructor(private userProfile: UserProfileService, private gameService: GameService) {}

  ngOnInit() {
    console.log('[APP] Initializing...');
    this.userProfile.loadProfile().subscribe();

    this.gameService.getAllGames().subscribe();
    this.gameService.getRecentGames().subscribe();
    this.gameService.getComingGames().subscribe();
    this.gameService.getRecommendedGame().subscribe();
  }
}
