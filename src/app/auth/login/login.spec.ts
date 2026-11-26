import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { routes } from '../../app.routes';
import { provideRouter, Router } from '@angular/router';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  it('navigates to employees after successful login', async () => {
  component.loginForm.setValue({
    username: 'admin',
    password: 'admin123',
  });

  await component.onSubmit();
  await fixture.whenStable();

  expect(TestBed.inject(Router).url).toBe('/employees');
  expect(sessionStorage.getItem('employee-backoffice-auth')).toBe('true');
});

  beforeEach(async () => {
    sessionStorage.removeItem('employee-backoffice-auth');
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

  it('provides a named login form without the temporary debug status', () => {
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('main')).not.toBeNull();
    expect(page.querySelector('h1')?.textContent).toBe('Welcome back');
    expect(page.querySelector('form')?.getAttribute('aria-labelledby')).toBe('login-title');
    expect(page.textContent).not.toContain('Form valid:');
  });

    it('rejects submission when required fields are empty', () => {
    component.onSubmit();

    expect(component.errorMessage)
      .toBe('Username dan password wajib diisi.');
  });

  it('rejects incorrect credentials', () => {
    component.loginForm.setValue({
      username: 'admin',
      password: 'wrong-password',
    });

    component.onSubmit();

    expect(component.errorMessage)
      .toBe('Username atau password salah.');
  });

  it('clears the previous error for correct credentials', async () => {
    component.errorMessage = 'Username atau password salah.';
    component.loginForm.setValue({
      username: 'admin',
      password: 'admin123',
    });

    await component.onSubmit();

    expect(component.errorMessage).toBe('');
  });

  it('shows an actionable error instead of crashing when session storage is blocked', async () => {
    component.loginForm.setValue({ username: 'admin', password: 'admin123' });
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    try {
      await component.onSubmit();

      expect(component.errorMessage).toContain('Penyimpanan sesi');
      expect(TestBed.inject(Router).url).not.toBe('/employees');
    } finally {
      write.mockRestore();
    }
  });

});
