import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {
  constructor(private http: HttpClient) {}

  getReleases(): Observable<any> {
    return this.http.get('/api/releases');
  }

  createRelease(release: string): Observable<any> {
    return this.http.post('/api/releases', { release });
  }

  getDeployments(): Observable<any> {
    return this.http.get('/api/deployments');
  }

  createDeployment(deployment: any): Observable<any> {
    return this.http.post('/api/deployments', deployment);
  }

  updateDeployment(id: string, deployment: any): Observable<any> {
    return this.http.put(`/api/deployments/${id}`, deployment);
  }

  deleteDeployment(id: string): Observable<any> {
    return this.http.delete(`/api/deployments/${id}`);
  }

  generateReport(release: string, environment: string): Observable<any> {
    return this.http.get('/api/reports/general', { params: { release, environment }, responseType: 'text' });
  }

  logout(): Observable<any> {
    return this.http.post('/api/logout', {});
  }
}