import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';
import { Dog, DogsResponse, DogFilter } from '../models/dog.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DogsService {
  private readonly baseUrl: string;

  // BehaviorSubjects for state management
  _dogs = new BehaviorSubject<Dog[]>([]);
  _page = new BehaviorSubject<number>(1);
  _size = new BehaviorSubject<number>(10);
  _total = new BehaviorSubject<number>(0);
  _filter = new BehaviorSubject<DogFilter>({});
  _includeDeleted = new BehaviorSubject<boolean>(false);
  _loading = new BehaviorSubject<boolean>(false);
  _error = new BehaviorSubject<string | null>(null);
  _viewMode = new BehaviorSubject<'grid' | 'list'>('grid');
  _sortBy = new BehaviorSubject<'name' | 'breed' | 'age' | 'supplier'>('breed');

  // Modern signal approach
  private _dogsSignal = signal<Dog[]>([]);
  readonly dogsSignal = this._dogsSignal.asReadonly();

  // Public readonly observables
  readonly dogs$ = this._dogs.asObservable();
  readonly page$ = this._page.asObservable();
  readonly size$ = this._size.asObservable();
  readonly total$ = this._total.asObservable();
  readonly filter$ = this._filter.asObservable();
  readonly includeDeleted$ = this._includeDeleted.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();
  readonly viewMode$ = this._viewMode.asObservable();
  readonly sortBy$ = this._sortBy.asObservable();

  // Computed observables for derived state
  readonly dogsInService$ = this.dogs$.pipe(
    map(dogs => dogs.filter(dog => dog.currentStatus === 'In Service'))
  );

  readonly dogsInTraining$ = this.dogs$.pipe(
    map(dogs => dogs.filter(dog => dog.currentStatus === 'In Training'))
  );

  readonly dogsRetired$ = this.dogs$.pipe(
    map(dogs => dogs.filter(dog => dog.currentStatus === 'Retired'))
  );

  readonly dogsLeft$ = this.dogs$.pipe(
    map(dogs => dogs.filter(dog => dog.currentStatus === 'Left'))
  );

  // Filtered dogs based on current filter
  readonly filteredDogs$ = combineLatest([
    this.dogs$,
    this.filter$,
    this.sortBy$
  ]).pipe(
    map(([dogs, filter, sortBy]) => {
      const filtered = this.applyFilter(dogs, filter);
      return this.applySortBy(filtered, sortBy);
    })
  );

  readonly statusCounts$ = combineLatest([
    this.dogsInService$,
    this.dogsInTraining$,
    this.dogsRetired$,
    this.dogsLeft$
  ]).pipe(
    map(([inService, inTraining, retired, left]) => ({
      inService: inService.length,
      inTraining: inTraining.length,
      retired: retired.length,
      left: left.length
    }))
  );

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.baseUrl = this.apiConfig.getDogsUrl();
  }

  // Filter helper method
  private applyFilter(dogs: Dog[], filter: DogFilter): Dog[] {
    if (!filter || Object.keys(filter).length === 0) {
      return dogs;
    }

    return dogs.filter(dog => {
      const matchesName = !filter.name || dog.name.toLowerCase().includes(filter.name.toLowerCase());
      const matchesBreed = !filter.breed || dog.breed.toLowerCase().includes(filter.breed.toLowerCase());
      const matchesSupplier = !filter.supplier || dog.supplier.toLowerCase().includes(filter.supplier.toLowerCase());

      return matchesName && matchesBreed && matchesSupplier;
    });
  }

  // Sort helper method
  private applySortBy(dogs: Dog[], sortBy: 'name' | 'breed' | 'age' | 'supplier'): Dog[] {
    const sorted = [...dogs];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'breed':
        return sorted.sort((a, b) => a.breed.localeCompare(b.breed));
      case 'supplier':
        return sorted.sort((a, b) => a.supplier.localeCompare(b.supplier));
      case 'age':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.birthDate).getTime();
          const dateB = new Date(b.birthDate).getTime();
          return dateA - dateB; // Oldest first
        });
      default:
        return sorted;
    }
  }

  // Actions to update state
  setPage(page: number): void {
    this._page.next(page);
    this.loadDogs();
  }

  setSize(size: number): void {
    this._size.next(size);
    this._page.next(1); // Reset to first page
    this.loadDogs();
  }

  setFilter(filter: DogFilter): void {
    this._filter.next(filter);
  }

  setIncludeDeleted(include: boolean): void {
    this._includeDeleted.next(include);
    this._page.next(1); // Reset to first page
    this.loadDogs();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this._viewMode.next(mode);
  }

  setSortBy(sortBy: 'name' | 'breed' | 'age' | 'supplier'): void {
    this._sortBy.next(sortBy);
  }

  clearError(): void {
    this._error.next(null);
  }

  // API methods
  loadDogs(): void {
    this._loading.next(true);
    this._error.next(null);

    const params = new HttpParams()
      .set('page', this._page.value.toString())
      .set('size', this._size.value.toString())
      .set('includeDeleted', this._includeDeleted.value.toString());

    // Add filter if provided
    const filterValue = this._filter.value;
    if (filterValue && Object.keys(filterValue).length > 0) {
      params.set('filter', JSON.stringify(filterValue));
    }

    this.http.get<DogsResponse>(`${this.baseUrl}/`, { params }).subscribe({
      next: (response) => {
        this._dogs.next(response.data || []);
        this._dogsSignal.set(response.data || []); // Keep signal in sync
        this._total.next(response.total || 0);
        this._loading.next(false);
      },
      error: (error) => {
        this._error.next(error.message || 'Failed to load dogs');
        this._loading.next(false);
      }
    });
  }

  getDog(id: string): Observable<Dog> {
    return this.http.get<Dog>(`${this.baseUrl}/${id}/`);
  }

  createDog(dog: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>): Observable<Dog> {
    return this.http.post<Dog>(`${this.baseUrl}/`, dog);
  }

  updateDog(id: string, dog: Partial<Dog>): Observable<Dog> {
    const url = `${this.baseUrl}/${id}/`;
    return this.http.put<Dog>(url, dog);
  }

  deleteDog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }

  // Method to refresh current list after create/update/delete
  refresh(): void {
    this.loadDogs();
  }

  // Method to add a dog to the current list (for optimistic updates)
  addDogToList(dog: Dog): void {
    const currentDogs = this._dogs.value;
    this._dogs.next([dog, ...currentDogs]);
    this._dogsSignal.set([dog, ...currentDogs]); // Keep signal in sync
    this._total.next(this._total.value + 1);
  }

  // Method to update a dog in the current list
  updateDogInList(updatedDog: Dog): void {
    const currentDogs = this._dogs.value;
    const updatedDogs = currentDogs.map(dog => dog.id === updatedDog.id ? updatedDog : dog);
    this._dogs.next(updatedDogs);
    this._dogsSignal.set(updatedDogs); // Keep signal in sync
  }

  // Method to remove a dog from the current list (soft delete)
  removeDogFromList(id: string): void {
    const currentDogs = this._dogs.value;
    const filteredDogs = currentDogs.filter(dog => dog.id !== id);
    this._dogs.next(filteredDogs);
    this._dogsSignal.set(filteredDogs); // Keep signal in sync
    this._total.next(Math.max(0, this._total.value - 1));
  }
}


