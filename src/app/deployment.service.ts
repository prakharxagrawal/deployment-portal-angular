import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {

  exportCSV(release: string, environment: string, team: string): Observable<Blob> {
    return this.http.get('/api/reports/general', {
      params: { 
        release: release || '', 
        environment: environment || '', 
        team: team || '' 
      },
      responseType: 'blob',
      withCredentials: true
    });
  }
  
  constructor(private http: HttpClient) {}

  getReleases(): Observable<any> {
    return this.http.get('/api/releases', { withCredentials: true });
  }

  createRelease(release: string): Observable<any> {
    return this.http.post('/api/releases', { release }, { withCredentials: true });
  }

  getDeployments(search?: string, configFilter?: string): Observable<any> {
    const params: Record<string, string> = {};
    if (search !== undefined) {
      params['search'] = search;
    }
    if (configFilter !== undefined) {
      params['config'] = configFilter;
    }
    return this.http.get('/api/deployments', { params, withCredentials: true });
  }

  createDeployment(deployment: any): Observable<any> {
    return this.http.post('/api/deployments', deployment, { withCredentials: true });
  }

  updateDeployment(id: string, deployment: any): Observable<any> {
    return this.http.put(`/api/deployments/${id}`, deployment, { withCredentials: true });
  }

  deleteDeployment(id: string): Observable<any> {
    return this.http.delete(`/api/deployments/${id}`, { withCredentials: true });
  }

  generateReport(release: string, environment: string): Observable<any> {
    return this.http.get('/api/reports/general', { 
      params: { release, environment }, 
      responseType: 'text',
      withCredentials: true 
    });
  }

  logout(): Observable<any> {
    return this.http.post('/api/logout', {}, { withCredentials: true });
  }
}