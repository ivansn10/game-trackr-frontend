import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../services/user-profile/user-profile.service';

@Component({
  selector: 'app-profile-management-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-management-modal.component.html',
})
export class ProfileManagementModalComponent implements OnInit {
  @Input() mode: 'avatar' | 'name' = 'name';
  @Output() close = new EventEmitter<void>();

  newName: string = '';
  selectedImageUrl: string | null = null;

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit() {
    const profile = this.userProfileService.current;
    if (!profile) return;

    if (this.mode === 'name') {
      this.newName = profile.displayName;
    } else if (this.mode === 'avatar') {
      this.selectedImageUrl = profile.avatarUrl ?? null;
    }
  }

  handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    console.log('[PROFILE MANAGEMENT] Saving changes...');
    const profileUpdate =
      this.mode === 'name' && this.newName.trim()
        ? { displayName: this.newName.trim() }
        : this.mode === 'avatar' && this.selectedImageUrl
        ? { avatarUrl: this.selectedImageUrl }
        : null;

    if (!profileUpdate) return;

    if ((this.userProfileService as any).allowRemoteSync === false) {
      this.userProfileService.updateLocalOnly(profileUpdate);
    } else {
      this.userProfileService.updateProfile(profileUpdate);
    }

    this.close.emit();
  }
}
