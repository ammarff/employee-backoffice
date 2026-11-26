import { Component, effect, inject, OnInit } from '@angular/core';
import { EmployeeStore } from '../employee-store';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import '@angular/common/locales/global/id';

@Component({
  imports: [
  MatTableModule, MatPaginatorModule, MatSortModule,
  ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, RouterLink,
  CurrencyPipe,
],
  selector: 'app-employee-list',
  styleUrl: './employee-list.scss',
  templateUrl: './employee-list.html',
})
export class EmployeeList implements OnInit, AfterViewInit {
  readonly store = inject(EmployeeStore);
  readonly dataSource = new MatTableDataSource(this.store.employees());
  readonly searchForm = new FormGroup({
    username: new FormControl('', { nonNullable: true }),
    group: new FormControl('', { nonNullable: true }),
  });
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => this.updateFilteredData());
  }

  resetStoredData() {
    if (window.confirm('Ganti data tersimpan dengan 100 dummy employee? Data lama akan ditimpa.')) {
      if (this.store.reset()) this.paginator.firstPage();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  readonly displayedColumns = ['username', 'name', 'email', 'group', 'status', 'basicSalary', 'actions'];

  notifyAction(action: 'Edit' | 'Delete', username: string) {
    this.snackBar.open(`${action} ${username} (demo, data tidak diubah).`, 'Tutup', {
      panelClass: action === 'Edit' ? 'notification-edit' : 'notification-delete',
      politeness: 'polite',
    });
  }

  private updateFilteredData() {
    const values = this.searchForm.getRawValue();
    const username = values.username.trim().toLowerCase();
    const group = values.group.trim().toLowerCase();

    this.dataSource.data = this.store.employees().filter(employee =>
      employee.username.toLowerCase().includes(username) &&
      employee.group.toLowerCase().includes(group)
    );
  }

  applyFilters() {
    const values = this.searchForm.getRawValue();
    this.updateFilteredData();
    this.paginator.firstPage();

    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        username: values.username.trim() || null,
        group: values.group.trim() || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit() {
    // shortcut: restore filters on creation; observe queryParamMap for same-page Back/Forward support.
    const params = this.route.snapshot.queryParamMap;
    this.searchForm.setValue({
      username: params.get('username') ?? '',
      group: params.get('group') ?? '',
    });
    this.updateFilteredData();
  }
}
