import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Router, provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { RouterTestingHarness } from '@angular/router/testing';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the login page through routing', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/login');
    await fixture.whenStable();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('input[formControlName="username"]'))
      .not.toBeNull();
    expect(page.querySelector('input[formControlName="password"]'))
      .not.toBeNull();
  });

  it('opens Add Employee instead of treating add as an employee ID', async () => {
    sessionStorage.setItem('employee-backoffice-auth', 'true');
    try {
      const harness = await RouterTestingHarness.create('/employees/add');
      expect(harness.routeNativeElement?.querySelector('h1')?.textContent)
        .toBe('Add Employee');
    } finally {
      sessionStorage.removeItem('employee-backoffice-auth');
    }
  });

  it('preserves search values and results through list, detail, and OK using real routes', async () => {
    sessionStorage.setItem('employee-backoffice-auth', 'true');
    localStorage.removeItem('employee-backoffice-employees');
    try {
      const harness = await RouterTestingHarness.create(
        '/employees?username=employee1&group=Group%202',
      );
      const detailLink = harness.routeNativeElement?.querySelector<HTMLAnchorElement>('tr[mat-row] a');
      expect(detailLink?.textContent?.trim()).toBe('employee12');
      detailLink!.click();
      await harness.fixture.whenStable();

      expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('employee12');
      const ok = harness.routeNativeElement?.querySelector<HTMLAnchorElement>('a');
      expect(ok?.textContent?.trim()).toBe('OK');
      ok!.click();
      await harness.fixture.whenStable();

      const page = harness.routeNativeElement!;
      expect(page.querySelector<HTMLInputElement>('[formControlName="username"]')?.value).toBe('employee1');
      expect(page.querySelector<HTMLInputElement>('[formControlName="group"]')?.value).toBe('Group 2');
      expect(page.querySelectorAll('tr[mat-row]')).toHaveLength(1);
      expect(page.querySelector('tr[mat-row] td')?.textContent?.trim()).toBe('employee12');
    } finally {
      sessionStorage.removeItem('employee-backoffice-auth');
      localStorage.removeItem('employee-backoffice-employees');
    }
  });

});
