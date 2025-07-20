/**
 * Main Entry Point for the Deployment Portal Angular Application
 * 
 * This file bootstraps the Angular application using standalone components.
 * It initializes the AppComponent with the configuration defined in app.config.ts.
 * 
 * The application uses Angular 16+ standalone components approach, which means:
 * - No traditional NgModule setup required
 * - Components are self-contained with their own imports
 * - More modern and simplified architecture
 * 
 * @author Deployment Portal Team
 * @version 1.0
 */

// Import Angular platform bootstrap function for starting the application
import { bootstrapApplication } from '@angular/platform-browser';

// Import application configuration (providers, routing, etc.)
import { appConfig } from './app/app.config';

// Import the root component of the application
import { AppComponent } from './app/app.component';

// Bootstrap the Angular application
// This starts the application by:
// 1. Creating an instance of AppComponent
// 2. Applying the configuration from appConfig
// 3. Mounting the component to the DOM (index.html)
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err)); // Log any bootstrap errors to console
