import { Service, signal } from '@angular/core';

@Service()
export class Auth {
  readonly errorMessage = signal('');

  login(username: string, password: string): boolean {
    this.errorMessage.set('');
    if (username !== 'admin' || password !== 'admin123') return false;
    try {
      sessionStorage.setItem('employee-backoffice-auth', 'true');
      return true;
    } catch {
      this.errorMessage.set('Penyimpanan sesi tidak dapat diakses. Izinkan browser storage lalu coba lagi.');
      return false;
    }
  }

  isAuthenticated(): boolean {
    try {
      return sessionStorage.getItem('employee-backoffice-auth') === 'true';
    } catch {
      return false;
    }
  }
}
