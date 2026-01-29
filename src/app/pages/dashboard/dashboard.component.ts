import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemSectionComponent } from '../../components/item-section/item-section.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ItemSectionComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
