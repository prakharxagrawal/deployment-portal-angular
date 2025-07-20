import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReleaseDialogComponent } from './create-release-dialog.component';

describe('CreateReleaseDialogComponent', () => {
  let component: CreateReleaseDialogComponent;
  let fixture: ComponentFixture<CreateReleaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateReleaseDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateReleaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
