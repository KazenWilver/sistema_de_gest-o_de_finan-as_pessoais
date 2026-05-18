import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, ApiResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('sgfp_user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get token(): string | null {
    return localStorage.getItem('sgfp_token');
  }

  register(data: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => this.storeAuth(res.data))
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(res => this.storeAuth(res.data))
    );
  }

  logout(): void {
    localStorage.removeItem('sgfp_token');
    localStorage.removeItem('sgfp_user');
    this.currentUserSubject.next(null);
  }

  me(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/auth/me`).pipe(
      map(res => res.data),
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('sgfp_user', JSON.stringify(user));
      })
    );
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/auth/profile`, data).pipe(
      map(res => res.data),
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('sgfp_user', JSON.stringify(user));
      })
    );
  }

  updatePassword(data: { current_password: string; new_password: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/password`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, password });
  }

  private storeAuth(data: { user: User; token: string }): void {
    localStorage.setItem('sgfp_token', data.token);
    localStorage.setItem('sgfp_user', JSON.stringify(data.user));
    this.currentUserSubject.next(data.user);
  }
}
