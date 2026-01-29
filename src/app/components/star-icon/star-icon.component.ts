import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      viewBox="0 0 24 24"
      class="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs *ngIf="half">
        <linearGradient id="halfGradient">
          <stop offset="50%" stop-color="#facc15" />
          <stop offset="50%" stop-color="transparent" />
        </linearGradient>
      </defs>
      <path
        [attr.fill]="
          half ? 'url(#halfGradient)' : filled ? '#facc15' : '#4B5563'
        "
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24
           l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46
           4.73L5.82 21z"
      />
    </svg>
  `,
})
export class StarIconComponent {
  @Input() filled = false;
  @Input() half = false;
}
