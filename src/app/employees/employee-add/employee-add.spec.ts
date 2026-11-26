import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { EmployeeAdd } from './employee-add';
import { EmployeeStore } from '../employee-store';
import { EmployeeList } from '../employee-list/employee-list';

const validValues = {
  username: 'new.employee',
  firstName: 'Dewi',
  lastName: 'Putri',
  email: 'dewi@example.com',
  birthDate: '1995-01-01T09:00',
  basicSalary: 7500000,
  status: 'Active',
  group: 'Group 2',
  description: '2026-01-01T09:00',
};

describe('EmployeeAdd', () => {
  let component: EmployeeAdd;
  let fixture: ComponentFixture<EmployeeAdd>;
  let store: EmployeeStore;

  beforeEach(async () => {
    localStorage.removeItem('employee-backoffice-employees');
    await TestBed.configureTestingModule({
      imports: [EmployeeAdd],
      providers: [provideRouter([{ path: 'employees', component: EmployeeList }])],
    }).compileComponents();
    fixture = TestBed.createComponent(EmployeeAdd);
    component = fixture.componentInstance;
    store = TestBed.inject(EmployeeStore);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem('employee-backoffice-employees');
  });

  it('starts with a disabled save button and mandatory fields', () => {
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    expect(component.employeeForm.invalid).toBe(true);
  });

  it.each(Object.keys(validValues))('does not save when %s is empty', async field => {
    component.employeeForm.setValue(validValues);
    component.employeeForm.get(field)!.reset();

    await component.onSave();

    expect(component.employeeForm.invalid).toBe(true);
    expect(store.employees()).toHaveLength(100);
    expect(component.errorMessage).not.toBe('');
  });

  it('rejects whitespace-only text and invalid email', () => {
    component.employeeForm.setValue(validValues);
    component.employeeForm.controls.firstName.setValue('   ');
    component.employeeForm.controls.email.setValue('invalid-email');

    expect(component.employeeForm.controls.firstName.invalid).toBe(true);
    expect(component.employeeForm.controls.email.invalid).toBe(true);
  });

  it('rejects a future birth date even when set programmatically', () => {
    component.employeeForm.setValue({ ...validValues, birthDate: '2099-01-01T12:00' });

    expect(component.employeeForm.controls.birthDate.invalid).toBe(true);
  });

  it('allows a birth time later today and exposes a local end-of-day maximum', () => {
    component.employeeForm.setValue({ ...validValues, birthDate: component.maxBirthDate });

    expect(component.employeeForm.valid).toBe(true);
    expect(component.maxBirthDate).toMatch(/T23:59$/);
  });

  it('rejects invalid calendar dates and invalid description dates', () => {
    component.employeeForm.setValue({
      ...validValues,
      birthDate: '2025-02-30T12:00',
      description: 'invalid-date',
    });

    expect(component.employeeForm.controls.birthDate.invalid).toBe(true);
    expect(component.employeeForm.controls.description.invalid).toBe(true);
  });

  it.each([NaN, Infinity, -Infinity])('rejects a non-finite salary: %s', value => {
    component.employeeForm.setValue({ ...validValues, basicSalary: value });

    expect(component.employeeForm.controls.basicSalary.invalid).toBe(true);
  });

  it('offers 10 searchable groups and rejects arbitrary group names', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const groupInput = await loader.getHarness(MatAutocompleteHarness);
    await groupInput.focus();
    expect(await groupInput.getOptions()).toHaveLength(10);

    await groupInput.enterText('Group 2');
    const options = await groupInput.getOptions();
    expect(await Promise.all(options.map(option => option.getText()))).toEqual(['Group 2']);
    await groupInput.selectOption({ text: 'Group 2' });
    expect(component.employeeForm.controls.group.value).toBe('Group 2');

    component.employeeForm.controls.group.setValue('Unknown group');
    expect(component.employeeForm.controls.group.invalid).toBe(true);
  });

  it('saves valid data, persists it, and navigates to the employee list', async () => {
    component.employeeForm.setValue(validValues);

    await component.onSave();

    const saved = store.employees().find(employee => employee.username === validValues.username);
    expect(saved).toMatchObject({
      ...validValues,
      birthDate: new Date(validValues.birthDate).toISOString(),
      description: new Date(validValues.description).toISOString(),
    });
    expect(saved?.id).toBeTruthy();
    expect(store.employees()).toHaveLength(101);
    expect(new EmployeeStore().employees()).toContainEqual(saved);
    expect(TestBed.inject(Router).url).toBe('/employees');
  });

  it('shows an error and stays on the form if saving fails', async () => {
    component.employeeForm.setValue(validValues);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });

    await component.onSave();
    await fixture.whenStable();

    expect(store.employees()).toHaveLength(100);
    expect(TestBed.inject(Router).url).not.toBe('/employees');
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('gagal disimpan');
    expect(component.saving).toBe(false);
  });

  it('cancels without saving employee data', async () => {
    component.employeeForm.setValue(validValues);
    const page = fixture.nativeElement as HTMLElement;
    const cancel = page.querySelector<HTMLAnchorElement>('a');
    expect(cancel?.textContent?.trim()).toBe('Cancel');

    cancel!.click();
    await fixture.whenStable();

    expect(store.employees()).toHaveLength(100);
    expect(TestBed.inject(Router).url).toBe('/employees');
  });
});
