import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, LoginRequest, LoginResponse, UserRole } from '../models/models';

const TOKEN_KEY = 'lms_token';
const USER_KEY = 'lms_user';

export interface StoredUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Reactive signal so the navbar / guards can react to login state changes
  currentUser = signal<StoredUser | null>(this.loadStoredUser());

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(res => {
        if (res.success) {
          const { token, userId, name, email, role } = res.data;
          localStorage.setItem(TOKEN_KEY, token);
          const user: StoredUser = { userId, name, email, role };
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this.currentUser.set(user);
        }
      }));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  private loadStoredUser(): StoredUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as StoredUser : null;
  }
}
