import { DogsService } from './core/services/dogs.service';
import { DogFilter } from './core/models/dog.model';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { DogToolbarComponent } from './shared/ui/dog-toolbar/dog-toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, DogToolbarComponent, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [MessageService],
})
export class App {
  protected readonly title = 'Dogs Frontend Code Test';
  readonly statusCounts$: any;

  constructor(public dogsService: DogsService) {
    this.statusCounts$ = this.dogsService.statusCounts$;
  }

  onFilterChange(filter: DogFilter): void {
    this.dogsService.setFilter(filter);
  }

  onIncludeDeletedChange(include: boolean): void {
    this.dogsService.setIncludeDeleted(include);
  }

  onViewModeChange(mode: 'grid' | 'list') {
    this.dogsService.setViewMode(mode);
  }

  onSortByChange(sortBy: 'name' | 'breed' | 'age' | 'supplier') {
    this.dogsService.setSortBy(sortBy);
  }

  onActivate(component: any) {
    // Component will subscribe to viewMode$ from the service
  }
}
