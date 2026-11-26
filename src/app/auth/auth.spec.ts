import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    sessionStorage.removeItem('employee-backoffice-auth');
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('stores a session after successful login', () => {
    expect(service.login('admin', 'admin123')).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(sessionStorage.getItem('employee-backoffice-auth')).toBe('true');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.removeItem('employee-backoffice-auth');
  });

  it.each([
    ['wrong-user', 'admin123'],
    ['admin', 'wrong-password'],
    ['wrong-user', 'wrong-password'],
  ])('rejects incorrect credentials without creating a session: %s', (username, password) => {
    expect(service.login(username, password)).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('employee-backoffice-auth')).toBeNull();
  });

  it('fails gracefully when session storage cannot be written', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    expect(service.login('admin', 'admin123')).toBe(false);
    expect(service.errorMessage()).toContain('Penyimpanan sesi');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('treats inaccessible session storage as unauthenticated', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    expect(service.isAuthenticated()).toBe(false);
  });

});
