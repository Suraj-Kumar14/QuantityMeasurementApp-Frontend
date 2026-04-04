import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MeasurementService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/quantities';

  compare(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/compare`, data);
  }

  convert(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/convert`, data);
  }

  add(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data);
  }

  subtract(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/subtract`, data);
  }

  addWithTargetUnit(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-with-target-unit`, data);
  }

  divide(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/divide`, data);
  }

  getAllHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }
}
