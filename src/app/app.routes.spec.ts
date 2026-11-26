import { routes } from './app.routes';
import { authGuard } from './auth/auth-guard';

describe('Application routes', () => {
  it.each(['login', 'employees', 'employees/add', 'employees/:id'])(
    'loads the %s page lazily',
    path => {
      const route = routes.find(item => item.path === path);

      expect(route?.loadComponent).toBeTypeOf('function');
      expect(route?.component).toBeUndefined();
    },
  );

  it.each(['employees', 'employees/add', 'employees/:id'])(
    'keeps the %s page protected by the login guard',
    path => {
      expect(routes.find(item => item.path === path)?.canActivate).toContain(authGuard);
    },
  );
});
