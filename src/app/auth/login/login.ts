import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';
import { Auth } from '../auth';

@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})

export class Login {
  errorMessage = '';
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  readonly loginForm  = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Username dan password wajib diisi.';
      return;
    }

    const { username, password } = this.loginForm.getRawValue();
    if (!this.auth.login(username, password)) {
      this.errorMessage = this.auth.errorMessage() || 'Username atau password salah.';
      return;
    }
    this.errorMessage = '';
    return this.router.navigateByUrl('/employees');
  }

}
