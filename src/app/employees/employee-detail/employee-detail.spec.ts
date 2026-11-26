import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeDetail } from './employee-detail';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { EmployeeStore } from '../employee-store';

describe('EmployeeDetail', () => {
  let component: EmployeeDetail;
  let fixture: ComponentFixture<EmployeeDetail>;

  beforeEach(async () => {
    localStorage.removeItem('employee-backoffice-employees');
    await TestBed.configureTestingModule({
      imports: [EmployeeDetail],
      providers: [
        provideRouter([
          { path: 'employees/:id', component: EmployeeDetail },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the employee matching the route ID', async () => {
    const harness = await RouterTestingHarness.create(
      '/employees/employee-12',
    );

    expect(harness.routeNativeElement?.textContent)
      .toContain('employee12');
  });

  it('shows a message when the employee does not exist', async () => {
    const harness = await RouterTestingHarness.create(
      '/employees/unknown-id',
    );

    expect(harness.routeNativeElement?.textContent)
      .toContain('Employee tidak ditemukan.');
  });

  it('formats the basic salary as Indonesian rupiah', async () => {
    const harness = await RouterTestingHarness.create(
      '/employees/employee-12',
    );

    expect(harness.routeNativeElement?.textContent)
      .toMatch(/Rp\.?\s*6\.100\.000,00/);
  });

  it('displays employee information and formatted dates', async () => {
    const harness = await RouterTestingHarness.create(
      '/employees/employee-12',
    );
    const text = harness.routeNativeElement?.textContent ?? '';

    expect(text).toContain('Employee 12');
    expect(text).toContain('employee12@example.com');
    expect(text).toContain('Active');
    expect(text).toContain('Group 2');
    expect(text).toContain('01 Januari 1995');
    expect(text).toContain('01 Januari 2026');
  });

  it('uses Back instead of OK and preserves search filters', async () => {
    const harness = await RouterTestingHarness.create(
      '/employees/employee-12?username=employee1&group=Group%202',
    );
    const page = harness.routeNativeElement!;
    const link = page.querySelector('a[aria-label="Kembali ke daftar employee"]');

    expect(link?.textContent?.trim()).toBe('Back');
    expect(link?.getAttribute('href'))
      .toBe('/employees?username=employee1&group=Group%202');
    expect(Array.from(page.querySelectorAll('a, button')).map(element => element.textContent?.trim()))
      .not.toContain('OK');
  });

  it('shows a breadcrumb and a Back link that preserve the search', async () => {
    const harness = await RouterTestingHarness.create(
      '/employees/employee-12?username=employee1&group=Group%202',
    );
    const page = harness.routeNativeElement!;
    const breadcrumb = page.querySelector('nav[aria-label="Breadcrumb"]');
    const back = page.querySelector('a[aria-label="Kembali ke daftar employee"]');

    expect(breadcrumb?.querySelector('a')?.textContent?.trim()).toBe('Employees');
    expect(breadcrumb?.querySelector('a')?.getAttribute('href'))
      .toBe('/employees?username=employee1&group=Group%202');
    expect(breadcrumb?.querySelector('[aria-current="page"]')?.textContent).toBe('employee12');
    expect(back?.textContent?.trim()).toBe('Back');
    expect(back?.getAttribute('href')).toBe('/employees?username=employee1&group=Group%202');
  });

  it('warns when the store could not read the saved data', async () => {
    TestBed.inject(EmployeeStore).storageError.set('Data tersimpan tidak valid.');
    const harness = await RouterTestingHarness.create('/employees/employee-12');

    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent)
      .toContain('Data tersimpan tidak valid.');
  });

});
