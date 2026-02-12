import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DogList } from './dog-list';
describe('DogList', () => {
  let component: DogList;
  let fixture: ComponentFixture<DogList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
