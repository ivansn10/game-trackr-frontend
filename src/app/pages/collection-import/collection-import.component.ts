import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-collection-import',
  imports: [RouterModule],
  templateUrl: './collection-import.component.html',
  standalone: true,
})
export class CollectionImportComponent {
  loginWithSteam() {
    window.location.href = 'https://store.steampowered.com';
  }
}
