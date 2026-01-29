import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataManagementModalComponent } from './data-management-modal.component';

describe('DataManagementModalComponent', () => {
  let component: DataManagementModalComponent;
  let fixture: ComponentFixture<DataManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataManagementModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
