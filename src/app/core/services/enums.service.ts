import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, of } from 'rxjs';
import { DogStatus, LeavingReason } from '../models/dog.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class EnumsService {
  private readonly baseUrl: string;
  
  private _statuses = new BehaviorSubject<DogStatus[]>([]);
  private _leavingReasons = new BehaviorSubject<LeavingReason[]>([]);
  private _loading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);

  readonly statuses$ = this._statuses.asObservable();
  readonly leavingReasons$ = this._leavingReasons.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.baseUrl = this.apiConfig.getEnumsUrl();
  }

  loadEnums(): void {
    this._loading.next(true);
    this._error.next(null);

    // Load both enums in parallel
    const statusRequest = this.http.get<DogStatus[]>(`${this.baseUrl}/enums/status/`).pipe(
      catchError(() => of(this.getDefaultStatuses()))
    );
    
    const leavingReasonsRequest = this.http.get<LeavingReason[]>(`${this.baseUrl}/enums/leaving-reasons/`).pipe(
      catchError(() => of(this.getDefaultLeavingReasons()))
    );

    // Subscribe to both requests
    statusRequest.subscribe({
      next: (statuses) => {
        this._statuses.next(statuses.length > 0 ? statuses : this.getDefaultStatuses());
      }
    });

    leavingReasonsRequest.subscribe({
      next: (reasons) => {
        this._leavingReasons.next(reasons.length > 0 ? reasons : this.getDefaultLeavingReasons());
      }
    });

    this._loading.next(false);
  }

  private getDefaultStatuses(): DogStatus[] {
    return ['In Training', 'In Service', 'Retired', 'Left'];
  }

  private getDefaultLeavingReasons(): LeavingReason[] {
    return [
      'Transferred',
      'Retired (Put Down)',
      'KIA',
      'Rejected',
      'Retired (Re-housed)',
      'Died'
    ];
  }

  // Individual getter methods for components
  getStatuses(): Observable<DogStatus[]> {
    return this.http.get<DogStatus[]>(`${this.baseUrl}/enums/status`);
  }

  getLeavingReasons(): Observable<LeavingReason[]> {
    return this.http.get<LeavingReason[]>(`${this.baseUrl}/enums/leaving-reasons`);
  }

  clearError(): void {
    this._error.next(null);
  }
}


