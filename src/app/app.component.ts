
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { DeploymentService } from './deployment.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NewRequestDialogComponent } from './new-request-dialog.component';
import { LoginComponent } from './login/login.component';
import { DeploymentComponent } from './deployment/deployment.component';
import { ReportComponent } from './report/report.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    LoginComponent,
    DeploymentComponent,
    ReportComponent,
    MatDialogModule,
    NewRequestDialogComponent
  ]
})
export class AppComponent implements OnInit {
  title = 'Microservices Request Page for CRS Olympus';
  user: any = null;
  deployments: any[] = [];
  releases: string[] = [];
  selectedDeployment: any = null;
  showLogin = true;

  constructor(
    private authService: AuthService,
    private deploymentService: DeploymentService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
  ) {}
  openNewRequestForm() {
    const dialogRef = this.dialog.open(NewRequestDialogComponent, {
      width: '600px',
      data: { releases: this.releases, user: this.user }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add createdBy field
        result.createdBy = this.user.username;
        this.deploymentService.createDeployment(result).subscribe(
          () => {
            this.loadDeployments();
            alert('Deployment created');
          },
          error => alert('Error creating deployment')
        );
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.user$.subscribe(user => {
        this.user = user;
        this.showLogin = !user;
        if (user) {
          this.loadDeployments();
          this.loadReleases();
        }
      });
    }
  }

  loadDeployments() {
    this.deploymentService.getDeployments().subscribe(data => this.deployments = data);
  }

  loadReleases() {
    this.deploymentService.getReleases().subscribe(data => this.releases = data.map((r: any) => r.name));
  }

  selectDeployment(deployment: any) {
    this.selectedDeployment = deployment;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.user = null;
      this.showLogin = true;
      this.deployments = [];
      this.releases = [];
      this.selectedDeployment = null;
    });
  }

  createRelease() {
    if (isPlatformBrowser(this.platformId)) {
      const release = prompt('Enter new release name:');
      if (release) {
        this.deploymentService.createRelease(release).subscribe(
          () => this.loadReleases(),
          error => alert('Error creating release')
        );
      }
    }
  }
}