import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope, AuthUser } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(this.readUser());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
  }

  private readUser(): AuthUser | null {
    const raw = localStorage.getItem('sgfp_user');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('sgfp_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.user()?.role === 'admin';
  }

  login(email: string, password: string): Observable<ApiEnvelope<{ token: string; user: AuthUser }>> {
    return this.http
      .post<ApiEnvelope<{ token: string; user: AuthUser }>>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          if (res.status === 'success' && res.data?.token) {
            localStorage.setItem('sgfp_token', res.data.token);
            localStorage.setItem('sgfp_user', JSON.stringify(res.data.user));
            this.user.set(res.data.user);
          }
        }),
      );
  }

  register(
    email: string,
    password: string,
    language = 'pt',
    base_currency = 'EUR',
  ): Observable<ApiEnvelope<{ token: string; user: AuthUser }>> {
    return this.http
      .post<ApiEnvelope<{ token: string; user: AuthUser }>>(`${environment.apiUrl}/auth/register`, {
        email,
        password,
        language,
        base_currency,
      })
      .pipe(
        tap((res) => {
          if (res.status === 'success' && res.data?.token) {
            localStorage.setItem('sgfp_token', res.data.token);
            localStorage.setItem('sgfp_user', JSON.stringify(res.data.user));
            this.user.set(res.data.user);
          }
        }),
      );
  }

  forgot(email: string): Observable<ApiEnvelope<{ message: string }>> {
    return this.http.post<ApiEnvelope<{ message: string }>>(`${environment.apiUrl}/auth/forgot`, { email });
  }

  reset(token: string, password: string): Observable<ApiEnvelope<{ message: string }>> {
    return this.http.post<ApiEnvelope<{ message: string }>>(`${environment.apiUrl}/auth/reset`, {
      token,
      password,
    });
  }

  logout(): void {
    localStorage.removeItem('sgfp_token');
    localStorage.removeItem('sgfp_user');
    this.user.set(null);
    this.router.navigate(['/auth/login']);
  }

  refreshUserFromApi(): Observable<AuthUser> {
    return this.http.get<ApiEnvelope<AuthUser>>(`${environment.apiUrl}/auth/me`).pipe(
      map((res) => {
        if (res.status !== 'success') {
          throw new Error(res.message);
        }
        localStorage.setItem('sgfp_user', JSON.stringify(res.data));
        this.user.set(res.data);
        return res.data;
      }),
    );
  }
}
