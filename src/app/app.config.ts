import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SessionInterceptor } from './session.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SessionInterceptor,
      multi: true
    }
  ]
};