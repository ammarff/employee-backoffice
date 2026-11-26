import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router } from '@angular/router';
import { authGuard } from './auth-guard';
import { routes } from '../app.routes';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    sessionStorage.removeItem('employee-backoffice-auth');
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('redirects unauthenticated visitors to login', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/employees');

    expect(router.url).toBe('/login');
  });
});
