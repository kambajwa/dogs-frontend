import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';

import { Dog } from '../../../core/models/dog.model';
import { DogDetailsComponent } from '../dog-details/dog-details';


@Component({
  selector: 'app-dog-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, AvatarModule, DialogModule, DogDetailsComponent],
  templateUrl: './dog-card.html',
  styleUrls: ['./dog-card.scss'],
})
export class DogCardComponent {
  @Input({ required: true }) dog!: Dog;

  /** Optional: hide buttons when used in read-only contexts */
  @Input() showActions = true;

  /** Optional actions for CRUD UIs */
  @Output() view = new EventEmitter<Dog>();
  @Output() edit = new EventEmitter<Dog>();
  @Output() remove = new EventEmitter<Dog>();

  showDetailsDialog = signal(false);


  statusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' {
    const s = (status ?? '').toLowerCase();
    if (s.includes('service')) return 'success';
    if (s.includes('training')) return 'info';
    if (s.includes('retired')) return 'warn';
    if (s.includes('left') || s.includes('deleted')) return 'danger';
    return 'info';
  }
}
