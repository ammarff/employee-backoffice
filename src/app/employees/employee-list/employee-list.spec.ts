import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeList } from './employee-list';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { MatSortHarness } from '@angular/material/sort/testing';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { Router, provideRouter } from '@angular/router';

describe('EmployeeList', () => {
  let component: EmployeeList;
  let fixture: ComponentFixture<EmployeeList>;

  beforeEach(async () => {
    localStorage.removeItem('employee-backoffice-employees');
    await TestBed.configureTestingModule({
      imports: [EmployeeList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders an employee username in the table', () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('table')?.textContent)
      .toContain('employee1');
  });

  it('shows name, email, group, status, salary, and actions alongside the username', () => {
    const page = fixture.nativeElement as HTMLElement;
    const row = page.querySelector('tr[mat-row]')?.textContent ?? '';

    expect(row).toContain('Employee 1');
    expect(row).toContain('employee1@example.com');
    expect(row).toContain('Group 1');
    expect(row).toContain('Active');
    expect(row).toMatch(/Rp\.?\s*5\.000\.000,00/);
    expect(page.querySelectorAll('th')).toHaveLength(7);
  });

  it('shows an explanatory empty state when no employees match', async () => {
    component.searchForm.setValue({ username: 'no-matching-employee', group: '' });
    await component.applyFilters();
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelectorAll('tr[mat-row]')).toHaveLength(0);
    expect(page.querySelector('table [role="status"]')?.textContent)
      .toContain('Tidak ada employee yang sesuai');
    expect(page.querySelector('table td[colspan]')?.getAttribute('colspan'))
      .toBe(String(component.displayedColumns.length));
  });

  it('shows 10 employees on the first page with a paginator', () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelectorAll('tr[mat-row]').length).toBe(10);
    expect(page.querySelector('mat-paginator')).not.toBeNull();
  });

  it('changes pages and the number of rows through the paginator controls', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('tr[mat-row] td')?.textContent?.trim()).toBe('employee11');

    await paginator.setPageSize(25);
    expect(page.querySelectorAll('tr[mat-row]')).toHaveLength(25);
  });

  it('returns to the first page when applying a search', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();
    component.searchForm.setValue({ username: 'employee1', group: 'Group 2' });

    await component.applyFilters();
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('tr[mat-row] td')?.textContent?.trim()).toBe('employee12');
    expect(component.paginator.pageIndex).toBe(0);
  });

  it('sorts usernames in descending order', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const sort = await loader.getHarness(MatSortHarness);
    const [header] = await sort.getSortHeaders();

    await header.click();
    await header.click();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('tr[mat-row] td')?.textContent?.trim())
      .toBe('employee99');
  });

  it('combines username and group filters with AND', async () => {
    component.searchForm.setValue({
      username: 'employee1',
      group: 'Group 2',
    });
    component.applyFilters();
    await fixture.whenStable();

    const page = fixture.nativeElement as HTMLElement;
    const usernames = Array.from(page.querySelectorAll('tr[mat-row] td:first-child'))
      .map(cell => cell.textContent?.trim());
    expect(usernames).toEqual(['employee12']);
  });

  it('stores search filters in the URL', async () => {
    component.searchForm.setValue({
      username: 'employee1',
      group: 'Group 2',
    });

    await component.applyFilters();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    expect(router.parseUrl(router.url).queryParams)
      .toMatchObject({ username: 'employee1', group: 'Group 2' });
  });

  it('preserves filters when linking to employee detail', async () => {
    component.searchForm.setValue({
      username: 'employee1',
      group: 'Group 2',
    });
    await component.applyFilters();
    await fixture.whenStable();

    const page = fixture.nativeElement as HTMLElement;
    const link = page.querySelector('tr[mat-row] a');
    expect(link?.textContent?.trim()).toBe('employee12');
    expect(link?.getAttribute('href'))
      .toBe('/employees/employee-12?username=employee1&group=Group%202');
    const detail = page.querySelector('a[aria-label="Detail employee12"]');
    expect(detail?.hasAttribute('mat-icon-button')).toBe(true);
    expect(detail?.querySelector('mat-icon')?.getAttribute('fontIcon')).toBe('visibility');
    expect(detail?.getAttribute('href'))
      .toBe('/employees/employee-12?username=employee1&group=Group%202');
  });

  it('restores search filters from the URL', async () => {
    fixture.destroy();
    await TestBed.inject(Router).navigate([], {
      queryParams: { username: 'employee1', group: 'Group 2' },
    });

    fixture = TestBed.createComponent(EmployeeList);
    component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component.searchForm.getRawValue())
      .toEqual({ username: 'employee1', group: 'Group 2' });
    expect(component.dataSource.data.map(employee => employee.username))
      .toEqual(['employee12']);
  });

  it('updates the table data when the store changes', async () => {
    const employee = {
      ...component.store.employees()[0],
      id: 'new-employee',
      username: 'new-user',
    };
    expect(component.store.add(employee)).toBe(true);
    await fixture.whenStable();

    expect(component.dataSource.data).toContainEqual(employee);
  });

  it('shows storage errors instead of silently using fallback data', async () => {
    component.store.storageError.set('Data tersimpan tidak valid.');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('[role="alert"]')?.textContent)
      .toContain('Data tersimpan tidak valid.');
  });

  it('does not reset data when the user cancels confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const reset = vi.spyOn(component.store, 'reset');
    try {
      component.store.storageError.set('Data tersimpan tidak valid.');
      await fixture.whenStable();
      const page = fixture.nativeElement as HTMLElement;
      const button = page.querySelector<HTMLButtonElement>('button[name="resetEmployees"]');

      expect(button).not.toBeNull();
      button!.click();
      expect(confirm).toHaveBeenCalled();
      expect(reset).not.toHaveBeenCalled();
    } finally {
      confirm.mockRestore();
      reset.mockRestore();
    }
  });

  it('resets to dummy employees after explicit confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    try {
      component.store.add({ ...component.store.employees()[0], id: 'new-id' });
      component.store.storageError.set('Data tersimpan tidak valid.');
      await fixture.whenStable();
      const page = fixture.nativeElement as HTMLElement;
      const button = page.querySelector<HTMLButtonElement>('button[name="resetEmployees"]');

      expect(button).not.toBeNull();
      button!.click();
      await fixture.whenStable();

      expect(component.store.employees()).toHaveLength(100);
      expect(component.dataSource.data).toHaveLength(100);
      expect(page.querySelector('[role="alert"]')).toBeNull();
    } finally {
      confirm.mockRestore();
    }
  });

  it.each([
    { action: 'Edit', panelClass: 'notification-edit' },
    { action: 'Delete', panelClass: 'notification-delete' },
  ])('shows a distinct dummy $action notification without changing data', async ({ action, panelClass }) => {
    const before = JSON.stringify(component.store.employees());
    const saved = localStorage.getItem('employee-backoffice-employees');
    const page = fixture.nativeElement as HTMLElement;
    const button = page.querySelector<HTMLButtonElement>(`button[aria-label="${action} employee1"]`);

    expect(button).not.toBeNull();
    expect(button?.type).toBe('button');
    expect(button?.hasAttribute('mat-icon-button')).toBe(true);
    expect(button?.querySelector('mat-icon')?.getAttribute('fontIcon')).toBe(action.toLowerCase());
    expect(button?.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');
    button!.click();
    await fixture.whenStable();

    const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const notification = await loader.getHarness(MatSnackBarHarness);
    expect(await notification.getMessage()).toBe(`${action} employee1 (demo, data tidak diubah).`);
    expect(await (await notification.host()).hasClass(panelClass)).toBe(true);
    expect(await notification.getAriaLive()).toBe('polite');
    const wrapper = document.querySelector<HTMLElement>('.cdk-global-overlay-wrapper');
    expect(wrapper?.style.alignItems).toBe('flex-start');
    expect(JSON.stringify(component.store.employees())).toBe(before);
    expect(localStorage.getItem('employee-backoffice-employees')).toBe(saved);

    await notification.dismissWithAction();
    expect(await loader.hasHarness(MatSnackBarHarness)).toBe(false);
  });
});
