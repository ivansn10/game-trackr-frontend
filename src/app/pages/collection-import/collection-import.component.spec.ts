import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionImportComponent } from './collection-import.component';

describe('CollectionImportComponent', () => {
  let component: CollectionImportComponent;
  let fixture: ComponentFixture<CollectionImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionImportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
