import { Component, OnInit, inject } from '@angular/core';
import { RequestListComponent } from './request-list/request-list.component';
import { RequestDetailsComponent } from './request-details/request-details.component';
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
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NewRequestDialogComponent } from './new-request-dialog.component';
import { LoginComponent } from './login/login.component';
import { MainHeaderComponent } from './main-header/main-header.component';
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component';
import { BottomToolbarComponent } from './bottom-toolbar/bottom-toolbar.component';

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
    RequestListComponent,
    RequestDetailsComponent,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    ScrollingModule,
    MainHeaderComponent,
    MainToolbarComponent,
    BottomToolbarComponent
  ]
})
export class AppComponent implements OnInit {
  title = 'Microservices Request Page for CRS Olympus';
  user: any = null;
  deployments: any[] = [];
  filteredDeployments: any[] = [];
  statusFilter: string = '';
  envFilter: string = '';
  releaseFilter: string = '';
  configFilter: string = '';
  searchQuery: string = '';
  releases: string[] = [];
  selectedDeployment: any = null;
  showLogin = true;
  teams: string[] = ['Phoenix', 'Avengers', 'Transformers', 'Hyper Care', 'CRUD', 'Crusaders'];
  teamFilter: string = '';

  // Separate bottom toolbar filters for CSV export only
  exportReleaseFilter: string = '';
  exportEnvFilter: string = '';
  exportTeamFilter: string = '';

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
    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          // Add createdBy field
          result.createdBy = this.user.username;
          this.deploymentService.createDeployment(result).subscribe({
            next: () => {
              this.loadDeployments();
              alert('Deployment created');
            },
            error: () => alert('Error creating deployment')
          });
        }
      },
      error: () => alert('Error creating deployment')
    });
  }

  onNewRequest() {
    this.openNewRequestForm();
  }

  onEditRequest() {
    if (!this.selectedDeployment) return;
    const dialogRef = this.dialog.open(NewRequestDialogComponent, {
      width: '600px',
      data: {
        releases: this.releases,
        user: this.user,
        deployment: { ...this.selectedDeployment }
      }
    });
    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          // Only allow certain fields to be updated, e.g. status, environments, etc.
          // Keep serialNumber, createdBy, dateRequested, id from original
          const updatePayload = {
            ...result,
            serialNumber: this.selectedDeployment.serialNumber,
            createdBy: this.selectedDeployment.createdBy,
            dateRequested: this.selectedDeployment.dateRequested,
            id: this.selectedDeployment.id
          };
          this.deploymentService.updateDeployment(this.selectedDeployment.id, updatePayload).subscribe({
            next: () => {
              this.loadDeployments();
              alert('Deployment updated');
            },
            error: () => alert('Error updating deployment')
          });
        }
      },
      error: () => alert('Error updating deployment')
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Subscribe to user changes from AuthService
      this.authService.user$.subscribe(user => {
        if (user && user.role === 'user') {
          user.role = 'developer';
        }
        this.user = user;
        this.showLogin = !user;
        
        // Load data only when user is authenticated
        if (user) {
          this.loadDeployments();
          this.loadReleases();
        } else {
          // Clear data when user is not authenticated
          this.deployments = [];
          this.filteredDeployments = [];
          this.releases = [];
          this.selectedDeployment = null;
        }
      });
    }
  }

  loadDeployments(search?: string) {
    console.log('Loading deployments with search:', search);
    this.deploymentService.getDeployments(search, this.configFilter).subscribe({
      next: data => {
        console.log('Deployments loaded:', data);
        // Data is already sorted by backend (latest dateRequested first)
        this.deployments = data;
        this.applyFilters();
        // Auto-select first deployment if none selected or if search changed
        if (this.deployments.length > 0 && (!this.selectedDeployment || search)) {
          this.selectedDeployment = this.deployments[0];
          console.log('Auto-selected deployment:', this.selectedDeployment);
        }
      },
      error: (error) => {
        console.error('Error loading deployments:', error);
        alert('Error loading deployments: ' + error.message);
      }
    });
  }

  applyFilters() {
    let filtered = this.deployments;
    
    // Apply local filters for status, environment, release, and team
    if (this.statusFilter) {
      filtered = filtered.filter(d => (d.status || '').toLowerCase() === this.statusFilter.toLowerCase());
    }
    if (this.envFilter) {
      filtered = filtered.filter(d => (d.environments || []).includes(this.envFilter));
    }
    if (this.releaseFilter) {
      filtered = filtered.filter(d => d.release === this.releaseFilter);
    }
    if (this.teamFilter) {
      filtered = filtered.filter(d => (d.team || '').toLowerCase() === this.teamFilter.toLowerCase());
    }
    
    // Note: searchQuery is now handled by backend, not here
    this.filteredDeployments = filtered;
  }

  loadReleases() {
    this.deploymentService.getReleases().subscribe({
      next: data => this.releases = data.map((r: any) => r.name),
      error: () => alert('Error loading releases')
    });
  }

  selectDeployment(deployment: any) {
    console.log('Selecting deployment:', deployment);
    this.selectedDeployment = deployment;
    console.log('canEditRequest result:', this.canEditRequest());
  }
  onStatusFilterChange(value: string) {
    this.statusFilter = value;
    this.applyFilters();
  }
  onEnvFilterChange(value: string) {
    this.envFilter = value;
    this.applyFilters();
  }
  onReleaseFilterChange(value: string) {
    this.releaseFilter = value;
    this.applyFilters();
  }
  
  onConfigFilterChange(value: string) {
    this.configFilter = value;
    this.loadDeployments(this.searchQuery.trim() || undefined);
  }
  onSearchChange(value: string) {
    this.searchQuery = value;
    // Use backend search instead of local filtering
    this.loadDeployments(value.trim() || undefined);
  }
  onTeamFilterChange(value: string) {
    this.teamFilter = value;
    this.applyFilters();
  }
  
  // Separate handlers for bottom toolbar export filters (don't affect main list)
  onExportReleaseFilterChange(value: string) {
    this.exportReleaseFilter = value;
  }
  onExportEnvFilterChange(value: string) {
    this.exportEnvFilter = value;
  }
  onExportTeamFilterChange(value: string) {
    this.exportTeamFilter = value;
  }
  
  onExportCSV(event: {release: string, env: string, team: string}) {
    // Call backend to get CSV and trigger download
    this.deploymentService.exportCSV(event.release, event.env, event.team).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deployments_${event.release || 'all'}_${event.env || 'all'}_${event.team || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error exporting CSV')
    });
  }

  getStatusColor(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'open': return '#1976d2'; // blue
      case 'in progress': return '#ffb300'; // yellow
      case 'pending': return '#e53935'; // red
      case 'completed': return '#43a047'; // green
      default: return '#1976d2'; // default to blue (Open)
    }
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
        this.deploymentService.createRelease(release).subscribe({
          next: () => this.loadReleases(),
          error: () => alert('Error creating release')
        });
      }
    }
  }
  onRlmUpdate(deployment: any) {
    // Auto-save RLM changes for admin and superadmin users
    if (this.user && (this.user.role === 'admin' || this.user.role === 'superadmin') && deployment.id) {
      this.deploymentService.updateDeployment(deployment.id, deployment).subscribe({
        next: () => {
          // Silently update - no alert needed for RLM changes
          this.loadDeployments();
        },
        error: () => alert('Error updating RLM IDs')
      });
    }
  }

  onDeploymentUpdate(deployment: any) {
    // Handle deployment updates (status changes, RLM IDs, etc.) for admin and superadmin users
    if (this.user && (this.user.role === 'admin' || this.user.role === 'superadmin') && deployment.id) {
      this.deploymentService.updateDeployment(deployment.id, deployment).subscribe({
        next: () => {
          alert('Deployment updated successfully');
          this.loadDeployments();
        },
        error: () => alert('Error updating deployment')
      });
    }
  }

  get canEdit(): boolean {
    return this.canEditRequest();
  }
  
  get canCreate(): boolean {
    return this.canCreateRequest();
  }

  canEditRequest(): boolean {
    if (!this.user || !this.selectedDeployment) return false;
    
    // Superadmin can edit any request (opens edit dialog)
    if (this.user.role === 'superadmin') return true;
    
    // Developers can edit their own requests if status is Open or Pending
    if (this.user.role === 'developer') {
      const status = (this.selectedDeployment.status || '').toLowerCase();
      return (status === 'open' || status === 'pending') && 
             this.selectedDeployment.createdBy === this.user.username;
    }
    
    // Admins cannot use the edit dialog (they use inline editing for status/RLM only)
    return false;
  }
  
  canCreateRequest(): boolean {
    return !!this.user && (this.user.role === 'developer' || this.user.role === 'superadmin');
  }
}