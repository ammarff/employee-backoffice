import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl, FormControl, FormGroup, ReactiveFormsModule,
  ValidationErrors, Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EmployeeStore } from '../employee-store';
import { EMPLOYEE_EMAIL_PATTERN, EMPLOYEE_GROUPS, isEmployeeDateTime } from '../employee';

const requiredText = [Validators.required, Validators.pattern(/\S/)];

@Component({
  imports: [
    ReactiveFormsModule, RouterLink, MatAutocompleteModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
  ],
  selector: 'app-employee-add',
  templateUrl: './employee-add.html',
  styleUrl: './employee-add.scss',
})
export class EmployeeAdd {
  readonly store = inject(EmployeeStore);
  private readonly router = inject(Router);
  errorMessage = '';
  saving = false;

  readonly employeeForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: requiredText }),
    firstName: new FormControl('', { nonNullable: true, validators: requiredText }),
    lastName: new FormControl('', { nonNullable: true, validators: requiredText }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.pattern(EMPLOYEE_EMAIL_PATTERN)],
    }),
    birthDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, dateTimeValidator, notFutureBirthDate],
    }),
    basicSalary: new FormControl<number | null>(null, {
      validators: [Validators.required, finiteNumber],
    }),
    status: new FormControl('', { nonNullable: true, validators: requiredText }),
    group: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, knownGroup],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, dateTimeValidator],
    }),
  });

  private readonly groupQuery = toSignal(this.employeeForm.controls.group.valueChanges, {
    initialValue: '',
  });
  readonly filteredGroups = computed(() => {
    const query = this.groupQuery().trim().toLowerCase();
    return EMPLOYEE_GROUPS.filter(group => group.toLowerCase().includes(query));
  });

  get maxBirthDate(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}T23:59`;
  }

  async onSave() {
    if (this.saving) return;
    this.errorMessage = '';
    this.employeeForm.markAllAsTouched();
    if (this.employeeForm.invalid) {
      this.errorMessage = 'Lengkapi semua field dengan data yang valid.';
      return;
    }

    const values = this.employeeForm.getRawValue();
    if (values.basicSalary === null) return;
    this.saving = true;
    const saved = this.store.add({
      ...values,
      id: crypto.randomUUID(),
      username: values.username.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      status: values.status.trim(),
      basicSalary: values.basicSalary,
      birthDate: new Date(values.birthDate).toISOString(),
      description: new Date(values.description).toISOString(),
    });
    if (!saved) {
      this.saving = false;
      this.errorMessage = this.store.storageError();
      return;
    }

    return this.router.navigate(['/employees'], { queryParamsHandling: 'preserve' });
  }
}

function dateTimeValidator(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;
  if (!value) return null;
  return typeof value === 'string' && isEmployeeDateTime(value) ? null : { dateTime: true };
}

function notFutureBirthDate(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;
  if (typeof value !== 'string' || !isEmployeeDateTime(value)) return null;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return Date.parse(value) <= endOfToday.getTime() ? null : { futureDate: true };
}

function finiteNumber(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;
  if (value === null) return null;
  return typeof value === 'number' && Number.isFinite(value) ? null : { number: true };
}

function knownGroup(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;
  if (!value) return null;
  return typeof value === 'string' && EMPLOYEE_GROUPS.includes(value) ? null : { group: true };
}
