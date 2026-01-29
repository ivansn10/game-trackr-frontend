import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileManagementModalComponent } from './profile-management-modal.component';

describe('ProfileManagementModalComponent', () => {
  let component: ProfileManagementModalComponent;
  let fixture: ComponentFixture<ProfileManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileManagementModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
