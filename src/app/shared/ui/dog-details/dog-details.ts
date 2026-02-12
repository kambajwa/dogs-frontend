import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dog } from '../../../core/models/dog.model';
import { DogsService } from '../../../core/services/dogs.service';

import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dog-details',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    FieldsetModule,
    DividerModule,
    TagModule,
    ButtonModule,
  ],
  templateUrl: './dog-details.html',
  styleUrl: './dog-details.scss',
})
export class DogDetailsComponent implements OnInit {
  @Input({ required: true }) dog!: Dog;

  readonly dogsService = inject(DogsService);

  statusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' {
    const s = (status ?? '').toLowerCase();
    if (s.includes('service')) return 'success';
    if (s.includes('training')) return 'info';
    if (s.includes('retired')) return 'warn';
    if (s.includes('left') || s.includes('deleted')) return 'danger';
    return 'info';
  }

  ngOnInit(): void {
    // Component initialized with dog data
  }
}

