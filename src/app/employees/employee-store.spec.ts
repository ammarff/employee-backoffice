import { TestBed } from '@angular/core/testing';
import { EmployeeStore } from './employee-store';

describe('EmployeeStore', () => {
  let service: EmployeeStore;

  beforeEach(() => {
    localStorage.removeItem('employee-backoffice-employees');
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with at least 100 employees with unique IDs', () => {
  const employees = service.employees();

  expect(employees.length).toBeGreaterThanOrEqual(100);
  expect(new Set(employees.map(employee => employee.id)).size)
    .toBe(employees.length);
});

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem('employee-backoffice-employees');
  });

  it('persists the initial dummy employees', () => {
    expect(JSON.parse(localStorage.getItem('employee-backoffice-employees')!))
      .toEqual(service.employees());
  });

  it('restores saved employees without replacing them with dummy data', () => {
    const saved = [{ ...service.employees()[0], firstName: 'Saved employee' }];
    localStorage.setItem('employee-backoffice-employees', JSON.stringify(saved));

    expect(new EmployeeStore().employees()).toEqual(saved);
  });

  it('preserves a valid empty saved list', () => {
    localStorage.setItem('employee-backoffice-employees', '[]');

    expect(new EmployeeStore().employees()).toEqual([]);
  });

  it('persists an added employee and restores it in a new store', () => {
    const employee = { ...service.employees()[0], id: 'new-employee', username: 'new-user' };

    expect(service.add(employee)).toBe(true);
    expect(service.employees()).toContainEqual(employee);
    expect(new EmployeeStore().employees()).toContainEqual(employee);
  });

  it.each([
    { email: undefined },
    { email: 'invalid-email' },
    { firstName: '   ' },
    { basicSalary: '5000000' },
    { birthDate: '2099-01-01T00:00:00.000Z' },
    { birthDate: '2025-02-30T00:00:00.000Z' },
    { description: 'invalid-date' },
    { group: 'Unknown group' },
  ])('does not use or overwrite invalid saved employee data: %j', overrides => {
    const raw = JSON.stringify([{ ...service.employees()[0], ...overrides }]);
    localStorage.setItem('employee-backoffice-employees', raw);

    const restored = new EmployeeStore();

    expect(restored.employees()).toHaveLength(100);
    expect(restored.storageError()).not.toBe('');
    expect(restored.add({ ...service.employees()[0], id: 'new-id' })).toBe(false);
    expect(localStorage.getItem('employee-backoffice-employees')).toBe(raw);
  });

  it.each(['not-json', '{}', '[null]'])('handles corrupt storage without overwriting it: %s', raw => {
    localStorage.setItem('employee-backoffice-employees', raw);

    const restored = new EmployeeStore();

    expect(restored.employees()).toHaveLength(100);
    expect(restored.storageError()).not.toBe('');
    expect(localStorage.getItem('employee-backoffice-employees')).toBe(raw);
  });

  it('rejects duplicate IDs in saved data', () => {
    const employee = service.employees()[0];
    const raw = JSON.stringify([employee, employee]);
    localStorage.setItem('employee-backoffice-employees', raw);

    expect(new EmployeeStore().storageError()).not.toBe('');
    expect(localStorage.getItem('employee-backoffice-employees')).toBe(raw);
  });

  it('rejects invalid new employees and duplicate IDs without changing saved data', () => {
    const before = localStorage.getItem('employee-backoffice-employees');

    expect(service.add({ ...service.employees()[0], id: 'new-id', email: '' })).toBe(false);
    expect(service.add(service.employees()[0])).toBe(false);
    expect(service.employees()).toHaveLength(100);
    expect(localStorage.getItem('employee-backoffice-employees')).toBe(before);
  });

  it('does not claim an employee is saved when storage is full', () => {
    const before = [...service.employees()];
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });

    expect(service.add({ ...before[0], id: 'new-id' })).toBe(false);
    expect(service.employees()).toEqual(before);
    expect(service.storageError()).not.toBe('');
  });

  it('keeps rendering dummy data with a warning when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    const restored = new EmployeeStore();

    expect(restored.employees()).toHaveLength(100);
    expect(restored.storageError()).not.toBe('');
  });

  it('resets corrupt storage only when explicitly requested', () => {
    localStorage.setItem('employee-backoffice-employees', 'not-json');
    const restored = new EmployeeStore();

    expect(restored.reset()).toBe(true);
    expect(restored.storageError()).toBe('');
    expect(new EmployeeStore().employees()).toEqual(restored.employees());
  });
});
