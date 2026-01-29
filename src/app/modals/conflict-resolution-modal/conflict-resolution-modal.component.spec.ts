import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConflictResolutionModalComponent } from './conflict-resolution-modal.component';

describe('ConflictResolutionModalComponent', () => {
  let component: ConflictResolutionModalComponent;
  let fixture: ComponentFixture<ConflictResolutionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConflictResolutionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConflictResolutionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
