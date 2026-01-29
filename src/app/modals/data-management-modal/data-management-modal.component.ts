import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../../services/user-profile/user-profile.service';

@Component({
  selector: 'app-data-management-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-management-modal.component.html',
})
export class DataManagementModalComponent {

  constructor(private userProfileService: UserProfileService) {}

  @Input() mode: 'export' | 'import' | 'delete' = 'export';
  @Output() close = new EventEmitter<void>();

  selectedFileName: string = '';
  selectedFile: File | null = null;

  get title(): string {
    switch (this.mode) {
      case 'import':
        return 'Import Data';
      case 'delete':
        return 'Delete Local Data';
      default:
        return 'Export Data';
    }
  }

  get description(): string {
    switch (this.mode) {
      case 'import':
        return 'Choose a file to import your saved data.';
      case 'delete':
        return 'Are you sure you want to delete all local data? This action cannot be undone.';
      default:
        return 'Export your current data to a file you can save and re-import later.';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = input.files[0].name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  async handleExport() {
    const db = await this.openDB();
    const tx = db.transaction('userProfile', 'readonly');
    const store = tx.objectStore('userProfile');
    const request = store.get('profile');

    request.onsuccess = () => {
      const data = request.result;
      if (!data) {
        return;
      }
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'game-tracker-profile.json';
      a.click();
      URL.revokeObjectURL(url);
    };

    request.onerror = () => {
    };
  }

  handleImportFromSelectedFile() {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string);
        const db = await this.openDB();
        const tx = db.transaction('userProfile', 'readwrite');
        const store = tx.objectStore('userProfile');
        store.put(data, 'profile');

        await this.userProfileService.loadProfile().subscribe();

      } catch {
      }
    };
    reader.readAsText(this.selectedFile);
  }

  async handleDelete() {
    const db = await this.openDB();
    const tx = db.transaction('userProfile', 'readwrite');
    const store = tx.objectStore('userProfile');
    store.delete('profile');

    await this.userProfileService.loadProfile().subscribe();
  }

  async handleAction() {
    switch (this.mode) {
      case 'export':
        await this.handleExport();
        break;
      case 'import':
        this.handleImportFromSelectedFile();
        break;
      case 'delete':
        await this.handleDelete();
        break;
    }
    this.close.emit();
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GameTrackerDB', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('userProfile')) {
          db.createObjectStore('userProfile');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
