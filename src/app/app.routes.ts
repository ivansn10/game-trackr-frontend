import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DiscoverComponent } from './pages/discover/discover.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CollectionImportComponent } from './pages/collection-import/collection-import.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'discover',
    component: DiscoverComponent,
  },
  { path: 'profile', component: ProfileComponent },
  { path: 'collection-import', component: CollectionImportComponent },
];
