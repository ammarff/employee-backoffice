import { Service, signal } from '@angular/core';
import { Employee, EMPLOYEE_EMAIL_PATTERN, EMPLOYEE_GROUPS, isEmployeeDateTime } from './employee';

const STORAGE_KEY = 'employee-backoffice-employees';

@Service()
export class EmployeeStore {
  private readonly employeeState = signal<Employee[]>([]);
  private hasInvalidStoredData = false;
  readonly employees = this.employeeState.asReadonly();
  readonly storageError = signal('');

  constructor() {
    const dummyEmployees = createDummyEmployees();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        this.employeeState.set(dummyEmployees);
        this.save(dummyEmployees);
        return;
      }

      const saved: unknown = JSON.parse(raw);
      if (
        !Array.isArray(saved) ||
        !saved.every(isEmployee) ||
        new Set(saved.map(employee => employee.id)).size !== saved.length
      ) {
        throw new Error('Invalid saved employees');
      }
      this.employeeState.set(saved);
    } catch {
      this.hasInvalidStoredData = true;
      this.employeeState.set(dummyEmployees);
      this.storageError.set(
        'Data tersimpan tidak valid atau tidak dapat dibaca. Data asli tidak diubah; ' +
        'yang tampil adalah dummy. Penambahan dinonaktifkan sampai data dipulihkan atau direset.',
      );
    }
  }

  add(employee: Employee): boolean {
    if (this.hasInvalidStoredData) return false;
    if (!isEmployee(employee) || this.employees().some(item => item.id === employee.id)) {
      this.storageError.set('Employee tidak valid atau ID sudah digunakan. Data tidak disimpan.');
      return false;
    }
    return this.save([...this.employees(), employee]);
  }

  reset(): boolean {
    return this.save(createDummyEmployees());
  }

  private save(employees: Employee[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
      this.employeeState.set(employees);
      this.hasInvalidStoredData = false;
      this.storageError.set('');
      return true;
    } catch {
      this.storageError.set('Data gagal disimpan. Periksa izin atau kapasitas penyimpanan browser.');
      return false;
    }
  }
}

function createDummyEmployees(): Employee[] {
  return Array.from({ length: 100 }, (_, index) => ({
    id: `employee-${index + 1}`,
    username: `employee${index + 1}`,
    firstName: 'Employee',
    lastName: `${index + 1}`,
    email: `employee${index + 1}@example.com`,
    status: 'Active',
    group: EMPLOYEE_GROUPS[index % EMPLOYEE_GROUPS.length],
    basicSalary: 5000000 + index * 100000,
    birthDate: '1995-01-01T00:00:00.000Z',
    description: '2026-01-01T00:00:00.000Z',
  }));
}

function isEmployee(value: unknown): value is Employee {
  if (typeof value !== 'object' || value === null) return false;
  const employee = value as Employee;
  const textFields = [
    'id', 'username', 'firstName', 'lastName', 'email',
    'status', 'group', 'birthDate', 'description',
  ] as const;
  if (!textFields.every(key =>
    typeof employee[key] === 'string' && employee[key].trim().length > 0
  )) return false;

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return typeof employee.basicSalary === 'number' &&
    Number.isFinite(employee.basicSalary) &&
    EMPLOYEE_EMAIL_PATTERN.test(employee.email) &&
    EMPLOYEE_GROUPS.includes(employee.group) &&
    isEmployeeDateTime(employee.birthDate) &&
    Date.parse(employee.birthDate) <= endOfToday.getTime() &&
    isEmployeeDateTime(employee.description);
}
