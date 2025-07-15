import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private storageService: StorageService
  ) {
    // Only check session in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Defer session check to next tick to ensure DOM is ready
      setTimeout(() => this.checkSession(), 0);
    }
  }

  private checkSession(): void {
    // First check localStorage for persisted user data
    const storedUser = this.storageService.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userSubject.next(user);
      
      // Verify session is still valid on server
      this.getSession().subscribe({
        next: (response) => {
          // Session is valid, update with fresh data
          this.setUser(response);
        },
        error: () => {
          // Session expired, clear local storage
          this.clearUser();
        }
      });
    } else {
      // No stored user, check if there's an active session
      this.getSession().subscribe({
        next: (response) => {
          this.setUser(response);
        },
        error: () => {
          // No active session
          this.clearUser();
        }
      });
    }
  }

  private setUser(user: any): void {
    this.userSubject.next(user);
    this.storageService.setItem('user', JSON.stringify(user));
  }

  private clearUser(): void {
    this.userSubject.next(null);
    this.storageService.removeItem('user');
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post('/api/login', { username, password }, { withCredentials: true })
      .pipe(
        tap(response => this.setUser(response)),
        catchError(error => {
          this.clearUser();
          throw error;
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post('/api/logout', {}, { withCredentials: true })
      .pipe(
        tap(() => this.clearUser()),
        catchError(() => {
          // Even if logout fails on server, clear local data
          this.clearUser();
          return of({ message: 'Logged out locally' });
        })
      );
  }

  getSession(): Observable<any> {
    return this.http.get('/api/session', { withCredentials: true });
  }

  getCurrentUser(): any {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}