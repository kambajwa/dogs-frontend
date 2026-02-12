import { Routes } from '@angular/router';
import { DogList } from './modules/dogs/dog-list/dog-list';
import { AddDogComponent } from './shared/ui/add-dog/add-dog';

export const routes: Routes = [
  {
    path: '',
    component: DogList,
    title: 'Dogs List',
  },
  {
    path: 'add',
    component: AddDogComponent,
    title: 'Add dog',
  },
  {
    path: 'edit/:id',
    component: AddDogComponent,
    title: 'Edit dog',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
