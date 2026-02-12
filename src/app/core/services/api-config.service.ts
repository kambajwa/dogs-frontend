import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = this.determineApiBaseUrl();
  }

  getBaseUrl(): string {
    return this.apiBaseUrl;
  }

  getDogsUrl(): string {
    return `${this.apiBaseUrl}/dogs`;
  }

  getEnumsUrl(): string {
    return `${this.apiBaseUrl}/dogs`;
  }

  private determineApiBaseUrl(): string {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If running on localhost with port 80 (Docker), use port 8000 for API
    if (hostname === 'localhost' && (port === '80' || port === '')) {
      return 'http://localhost:8000/api';
    }
    
    // If running on localhost:4200 (dev server), use port 8000 for API
    if (hostname === 'localhost' && port === '4200') {
      return 'http://localhost:8000/api';
    }
    
    // Development environment - use environment variable if available
    if (!environment.production && environment.apiUrl) {
      return environment.apiUrl;
    }
    
    // Production environment - use environment variable if available
    if (environment.production && environment.apiUrl) {
      return environment.apiUrl;
    }
    
    // Default fallback - use relative URLs
    return '/api';
  }
}
