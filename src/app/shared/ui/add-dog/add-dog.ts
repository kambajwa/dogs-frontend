import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Checkbox } from 'primeng/checkbox';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Message } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DogsService } from '../../../core/services/dogs.service';
import { Dog, LeavingReason } from '../../../core/models/dog.model';

type DogStatus = 'In Service' | 'In Training' | 'Retired' | 'Left';
type Gender = 'Male' | 'Female' | 'Unknown';

@Component({
  selector: 'app-add-dog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    Card,
    InputText,
    Select,
    DatePicker,
    Checkbox,
    Textarea,
    Button,
    Divider,
    Message,
    ToastModule,
  ],
  templateUrl: './add-dog.html',
  styleUrl: './add-dog.scss',
})
export class AddDogComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  readonly dogsService = inject(DogsService);

  saving = signal(false);
  saveError = signal<string | null>(null);
  editingDogId = signal<string | null>(null);
  isEditMode = computed(() => this.editingDogId() !== null);

  statuses: DogStatus[] = ['In Service', 'In Training', 'Retired', 'Left'];

  genders: { label: string; value: Gender }[] = [
    { label: '---------', value: 'Unknown' },
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ];

  leavingReasons: { label: string; value: LeavingReason | null }[] = [
    { label: '---------', value: null },
    { label: 'Transferred', value: 'Transferred' },
    { label: 'Retired (Put Down)', value: 'Retired (Put Down)' },
    { label: 'KIA', value: 'KIA' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Retired (Re-housed)', value: 'Retired (Re-housed)' },
    { label: 'Died', value: 'Died' },
  ];

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    breed: ['', [Validators.maxLength(120)]],
    supplier: ['', [Validators.maxLength(120)]],
    badgeId: ['', [Validators.required, Validators.maxLength(40)]],
    gender: ['Unknown' as Gender, [Validators.required]],
    birthDate: [null as Date | null],
    dateAcquired: [null as Date | null],
    currentStatus: [null as DogStatus | null, [Validators.required]],
    leavingDate: [null as Date | null],
    leavingReason: [null as LeavingReason | null],
    kennellingCharacteristic: [''],
    deleted: [false],
  });

  showLeavingFields = computed(() => {
    const status = this.form.controls.currentStatus.value;
    return status === 'Left' || status === 'Retired';
  });

  constructor() {
    // Check if we're in edit mode
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.editingDogId.set(params['id']);
        this.loadDogForEditing(params['id']);
      }
    });

    this.form.controls.currentStatus.valueChanges.subscribe((status) => {
      const leavingDate = this.form.controls.leavingDate;
      const leavingReason = this.form.controls.leavingReason;

      if (status === 'Left' || status === 'Retired') {
        leavingDate.addValidators(Validators.required);
        leavingReason.addValidators(Validators.required);
      } else {
        leavingDate.clearValidators();
        leavingReason.clearValidators();
        leavingDate.setValue(null);
        leavingReason.setValue(null);
      }

      leavingDate.updateValueAndValidity({ emitEvent: false });
      leavingReason.updateValueAndValidity({ emitEvent: false });
    });
  }

  private loadDogForEditing(dogId: string) {
    firstValueFrom(this.dogsService.getDog(dogId)).then((dog) => {
      this.form.patchValue({
        name: dog.name,
        breed: dog.breed,
        supplier: dog.supplier,
        badgeId: dog.badgeId,
        gender: dog.gender as Gender,
        birthDate: dog.birthDate ? new Date(dog.birthDate) : null,
        dateAcquired: dog.dateAcquired ? new Date(dog.dateAcquired) : null,
        currentStatus: dog.currentStatus as DogStatus,
        leavingDate: dog.leavingDate ? new Date(dog.leavingDate) : null,
        leavingReason: dog.leavingReason ?? null,
        kennellingCharacteristic: dog.kennellingCharacteristic ?? '',
        deleted: dog.deleted,
      });
    }).catch((error) => {
      this.saveError.set('Failed to load dog data');
      console.error('Error loading dog:', error);
    });
  }

  setToday(controlName: 'birthDate' | 'dateAcquired' | 'leavingDate') {
    this.form.controls[controlName].setValue(new Date());
  }

  async save() {
    this.saveError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      const payload = this.toPayload();

      let result;
      if (this.isEditMode()) {
        const dogId = this.editingDogId()!;
        result = await firstValueFrom(this.dogsService.updateDog(dogId, payload));
        this.dogsService.updateDogInList(result);
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `${result.name} has been updated successfully.`,
        });
      } else {
        result = await firstValueFrom(this.dogsService.createDog(payload));
        this.dogsService.addDogToList(result);
        this.messageService.add({
          severity: 'success',
          summary: 'Created',
          detail: `${result.name} has been created successfully.`,
        });
      }
      await this.router.navigate(['/dogs']);
    } catch (e: any) {
      this.saveError.set(e?.message ?? 'Failed to save dog');

      // Show error toast - user stays on form
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.message ?? 'Failed to save dog. Please try again.',
      });
    } finally {
      this.saving.set(false);
    }
  }

  async saveAndAddAnother() {
    await this.save();
    this.form.reset({
      name: '',
      breed: '',
      supplier: '',
      badgeId: '',
      gender: 'Unknown',
      birthDate: null,
      dateAcquired: null,
      currentStatus: null,
      leavingDate: null,
      leavingReason: null,
      kennellingCharacteristic: '',
      deleted: false,
    });
  }

  cancel() {
    this.router.navigate(['/dogs']);
  }

  private toPayload() {
    const v = this.form.getRawValue();
    const dogPayload: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'> = {
      name: v.name.trim(),
      breed: v.breed.trim(),
      supplier: v.supplier.trim(),
      badgeId: v.badgeId.trim(),
      gender: v.gender === 'Male' || v.gender === 'Female' ? v.gender : 'Male',
      birthDate: v.birthDate ? this.toIsoDate(v.birthDate) : '',
      dateAcquired: v.dateAcquired ? this.toIsoDate(v.dateAcquired) : '',
      currentStatus: v.currentStatus!,
      leavingDate: v.leavingDate ? this.toIsoDate(v.leavingDate) : null,
      leavingReason: v.leavingReason ?? null,
      kennellingCharacteristic: v.kennellingCharacteristic?.trim() || null,
      deleted: v.deleted,
    };
    return dogPayload;
  }

  private toIsoDate(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
