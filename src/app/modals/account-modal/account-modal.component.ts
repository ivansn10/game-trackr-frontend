import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth-service.service';

@Component({
  selector: 'app-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-modal.component.html',
})
export class AccountModalComponent {
  @Input() isSignupMode = false;
  @Output() close = new EventEmitter<'login' | 'signup' | 'cancel'>();

  username = '';
  password = '';
  confirmPassword = '';

  constructor(private auth: AuthService) {}

  handleSubmit() {
    if (this.isSignupMode) {
      if (!this.username || !this.password) {
        alert('All fields are required.');
        return;
      }

      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      this.auth
        .register({ username: this.username, password: this.password })
        .subscribe({
          next: () => {
            this.close.emit('signup');
          },
          error: (err) => {
            const msg = err?.error?.message || 'Registration failed';
            alert(msg);
          },
        });
    } else {
      if (!this.username || !this.password) {
        alert('Username and password are required.');
        return;
      }

      this.auth
        .login({ username: this.username, password: this.password })
        .subscribe({
          next: () => {
            console.log('[MODAL] Emitting close: login');
            setTimeout(() => {
              this.close.emit('login');
            });
          },
          error: (err) => {
            const msg = err?.error?.message || 'Login failed';
            alert(msg);
          },
        });
    }
  }

  handleCancel() {
    this.close.emit('cancel');
  }
}
