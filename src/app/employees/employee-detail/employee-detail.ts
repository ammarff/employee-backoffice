import { Component, inject } from '@angular/core';
import { EmployeeStore } from '../employee-store';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import '@angular/common/locales/global/id';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, MatButtonModule, MatIconModule],
  selector: 'app-employee-detail',
  styleUrl: './employee-detail.scss',
  templateUrl: './employee-detail.html',
})
export class EmployeeDetail {

  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(EmployeeStore);
  readonly storageError = this.store.storageError;

  readonly employee = this.store.employees().find(
    employee => employee.id === this.route.snapshot.paramMap.get('id'),
  );
}
