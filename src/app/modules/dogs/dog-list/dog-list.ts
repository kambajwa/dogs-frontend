import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DogCardComponent } from '../../../shared/ui/dog-card/dog-card';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { Dog } from '../../../core/models/dog.model';
import { DogsService } from '../../../core/services/dogs.service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dog-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    PaginatorModule,
    ToastModule,
    DogCardComponent,
    ConfirmDialog,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './dog-list.html',
  styleUrl: './dog-list.scss',
})
export class DogList implements OnInit, OnDestroy {
  dogs$!: Observable<Dog[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  total$!: Observable<number>;
  size$!: Observable<number>;
  page$!: Observable<number>;
  statusCounts$!: Observable<any>;
  viewMode$!: Observable<'grid' | 'list'>;
  get dogsLength(): number {
    return this.dogsService._dogs.value.length;
  }

  constructor(
    public dogsService: DogsService,
    private messageService: MessageService,
    private confirm: ConfirmationService,
    private router: Router,
  ) {
    this.dogs$ = this.dogsService.filteredDogs$;
    this.loading$ = this.dogsService.loading$;
    this.error$ = this.dogsService.error$;
    this.total$ = this.dogsService.total$;
    this.size$ = this.dogsService.size$;
    this.page$ = this.dogsService.page$;
    this.statusCounts$ = this.dogsService.statusCounts$;
    this.viewMode$ = this.dogsService.viewMode$;
  }
  confirmDelete(dog: Dog) {
    this.confirm.confirm({
      header: `'Delete ${dog.name}?`,
      message: `This will delete ${dog.name}. You can’t undo this.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteDog(dog);
      },
    });
  }
  ngOnInit(): void {
    this.dogsService.loadDogs();
  }

  ngOnDestroy(): void {
    // No subscriptions to clean up
  }

  onPageChange(event: any): void {
    const newPage = Math.floor(event.first / event.rows) + 1;
    const newSize = event.rows;
    this.dogsService.setSize(newSize);
    this.dogsService.setPage(newPage);
  }

  deleteDog(dog: Dog) {
    console.log(`Deleting dog with id ${dog.id}...`);
    this.dogsService.deleteDog(dog.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `${dog.name} has been deleted.`,
        });
      },
      error: (err) => {
        console.error('Error deleting dog:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to delete ${dog.name}.`,
        });
      },
    });
  }

  editDog(dog: Dog) {
    this.router.navigate(['/edit', dog.id]);
  }
}
