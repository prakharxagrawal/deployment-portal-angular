import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone request and add withCredentials for all API calls
    const apiReq = req.url.startsWith('/api') ? 
      req.clone({ setHeaders: { 'Cache-Control': 'no-cache' }, withCredentials: true }) : 
      req;

    return next.handle(apiReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // If we get a 401 error on any API call (except login), clear the session
        if (error.status === 401 && !req.url.includes('/api/login')) {
          console.log('Session expired, logging out user');
          this.authService.logout().subscribe();
        }
        return throwError(() => error);
      })
    );
  }
}
