export interface Employee {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    group: string;
    basicSalary: number;
    birthDate: string;
    description: string;
}

export const EMPLOYEE_GROUPS = Array.from({ length: 10 }, (_, index) => `Group ${index + 1}`);
export const EMPLOYEE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmployeeDateTime(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  const date = value.slice(0, 10);
  return new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) === date;
}
