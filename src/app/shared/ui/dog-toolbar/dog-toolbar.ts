import { Component, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

import { DogFilter } from '../../../core/models/dog.model';

type DogsViewMode = 'grid' | 'list';
type DogsSortKey = 'name' | 'breed' | 'age' | 'supplier';

@Component({
  selector: 'app-dog-toolbar',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ToolbarModule,
    ButtonModule,
    ToggleButtonModule,
    InputTextModule,
    TagModule,
    SelectModule,
  ],
  templateUrl: './dog-toolbar.html',
  styleUrl: './dog-toolbar.scss',
})
export class DogToolbarComponent {
  private router = inject(Router);
  @Output() filterChange = new EventEmitter<DogFilter>();
  @Output() includeDeletedChange = new EventEmitter<boolean>();
  @Output() onToggleLive = new EventEmitter<void>();
  @Output() viewModeChange = new EventEmitter<DogsViewMode>();
  @Output() sortByChange = new EventEmitter<DogsSortKey>();
  @Output() addDog = new EventEmitter<void>();

  @Input() showStatusCounts = false;
  @Input() showLiveControls = false;
  @Input() isLiveMode = false;
  @Input() statusCounts: {
    inService: number;
    inTraining: number;
    retired: number;
    left: number;
  } | null = null;

  // Toolbar state
  nameFilter = '';
  breedFilter = '';
  supplierFilter = '';
  includeDeleted = false;

  viewMode: DogsViewMode = 'grid';
  sortBy: DogsSortKey = 'breed';

  sortOptions: Array<{ label: string; value: DogsSortKey }> = [
    { label: 'Name', value: 'name' },
    { label: 'Breed', value: 'breed' },
    { label: 'Age', value: 'age' },
    { label: 'Supplier', value: 'supplier' },
  ];

  setViewMode(mode: DogsViewMode) {
    this.viewMode = mode;
    this.viewModeChange.emit(mode);
    this.router.navigate(['/dogs']);
  }

  onFilterChange(): void {
    const filter: DogFilter = {};

    if (this.nameFilter.trim()) filter.name = this.nameFilter.trim();
    if (this.breedFilter.trim()) filter.breed = this.breedFilter.trim();
    if (this.supplierFilter.trim()) filter.supplier = this.supplierFilter.trim();

    this.filterChange.emit(filter);
  }

  onIncludeDeletedChange(): void {
    this.includeDeletedChange.emit(this.includeDeleted);
  }
  onAddDog() {
    console.log('Add Dog button clicked');
    this.router.navigate(['/add']);
  }
  clearFilters(): void {
    this.nameFilter = '';
    this.breedFilter = '';
    this.supplierFilter = '';
    this.includeDeleted = false;

    this.filterChange.emit({});
    this.includeDeletedChange.emit(false);
  }
}
