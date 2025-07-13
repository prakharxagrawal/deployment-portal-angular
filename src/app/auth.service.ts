import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post('/api/login', { username, password })
      .pipe(tap(response => this.userSubject.next(response)));
  }

  logout(): Observable<any> {
    return this.http.post('/api/logout', {})
      .pipe(tap(() => this.userSubject.next(null)));
  }
}