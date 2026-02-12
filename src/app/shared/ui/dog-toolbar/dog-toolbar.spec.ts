import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DogToolbarComponent } from './dog-toolbar';


describe('DogToolbar', () => {
  let component: DogToolbarComponent;
  let fixture: ComponentFixture<DogToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogToolbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DogToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
