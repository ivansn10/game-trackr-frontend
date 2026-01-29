import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../models/user-profile';

@Component({
  selector: 'app-conflict-resolution-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conflict-resolution-modal.component.html',
})
export class ConflictResolutionModalComponent {
  @Input() localProfile!: UserProfile;
  @Input() remoteProfile!: UserProfile;
  @Output() resolved = new EventEmitter<
    'local' | 'remote' | 'merge' | 'cancel'
  >();

  resolve(option: 'local' | 'remote' | 'merge' | 'cancel') {
    this.resolved.emit(option);
  }

  get mergedGameCount(): number {
    const allGames = [
      ...(this.localProfile?.gameCollection ?? []),
      ...(this.remoteProfile?.gameCollection ?? []),
    ];

    const seen = new Set<string>();

    const uniqueGames = allGames.filter((g) => {
      const key = g.igdbId
        ? String(g.igdbId)
        : g.gameTitle.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueGames.length;
  }
}
