import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  errorMessage = '';
  successMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  authData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const oauth2 = params['oauth2'];

      if (token && oauth2 === 'success') {
        this.authService.handleGoogleToken(token);
        this.successMessage = 'Google login successful! Redirecting...';

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      }
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetForm(): void {
    this.authData = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
  }

  switchMode(loginMode: boolean): void {
    this.isLoginMode = loginMode;
    this.clearMessages();
    this.resetForm();
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.clearMessages();
    this.resetForm();
  }

  loginWithGoogle(): void {
    this.clearMessages();
    this.authService.loginWithGoogle();
  }

  private isValidUsername(username: string): boolean {
    return /^(?=.*[A-Z])(?=.*[a-z]).+$/.test(username);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPassword(password: string): boolean {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password);
  }

  onSubmit(): void {
    this.clearMessages();

    if (!this.authData.email || !this.authData.password) {
      this.errorMessage = this.isLoginMode
        ? 'Email/Username and password are required!'
        : 'Email and password are required!';
      return;
    }

    if (!this.isLoginMode) {
      if (!this.authData.username) {
        this.errorMessage = 'Username is required!';
        return;
      }

      if (!this.isValidUsername(this.authData.username)) {
        this.errorMessage =
          'Username must contain at least 1 uppercase letter and 1 lowercase letter.';
        return;
      }

      if (!this.isValidEmail(this.authData.email)) {
        this.errorMessage = 'Please enter a valid email address.';
        return;
      }

      if (!this.isValidPassword(this.authData.password)) {
        this.errorMessage =
          'Password must contain at least 1 uppercase, 1 lowercase, 1 digit, 1 special symbol, and be at least 8 characters long.';
        return;
      }

      if (!this.authData.confirmPassword) {
        this.errorMessage = 'Confirm password is required!';
        return;
      }

      if (this.authData.password !== this.authData.confirmPassword) {
        this.errorMessage = 'Passwords do not match!';
        return;
      }

      const signupData = {
        username: this.authData.username.trim(),
        email: this.authData.email.trim(),
        password: this.authData.password,
      };

      this.authService.register(signupData).subscribe({
        next: (res) => {
          this.errorMessage = '';
          this.successMessage = res?.message || 'Signup successful! Redirecting to login...';

          setTimeout(() => {
            this.isLoginMode = true;
            this.resetForm();
            this.clearMessages();
          }, 2000);
        },
        error: (err) => {
          this.successMessage = '';
          this.errorMessage =
            err?.error?.message ||
            err?.error?.error ||
            err?.message ||
            'Signup failed. Please try again.';
        },
      });
    } else {
      const loginData = {
        usernameOrEmail: this.authData.email.trim(),
        password: this.authData.password,
      };

      this.authService.login(loginData).subscribe({
        next: (res) => {
          this.errorMessage = '';
          this.successMessage = res?.message || 'Login successful! Redirecting...';

          setTimeout(() => {
            this.clearMessages();
            this.resetForm();
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (err) => {
          this.successMessage = '';
          this.errorMessage =
            err?.error?.message ||
            err?.error?.error ||
            err?.message ||
            'Login failed. Invalid credentials.';
        },
      });
    }
  }
}
