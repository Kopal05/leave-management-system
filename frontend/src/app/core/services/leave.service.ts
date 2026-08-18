import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, CalendarEntry, DashboardResponse, Leave, LeaveRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class LeaveService {

  private baseUrl = `${environment.apiUrl}/leaves`;

  constructor(private http: HttpClient) {}

  applyLeave(request: LeaveRequest): Observable<ApiResponse<Leave>> {
    return this.http.post<ApiResponse<Leave>>(this.baseUrl, request);
  }

  getAllLeaves(): Observable<ApiResponse<Leave[]>> {
    return this.http.get<ApiResponse<Leave[]>>(this.baseUrl);
  }

  getMyLeaves(): Observable<ApiResponse<Leave[]>> {
    return this.http.get<ApiResponse<Leave[]>>(`${this.baseUrl}/my`);
  }

  updateLeave(id: number, request: LeaveRequest): Observable<ApiResponse<Leave>> {
    return this.http.put<ApiResponse<Leave>>(`${this.baseUrl}/${id}`, request);
  }

  cancelLeave(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  getTeamCalendar(): Observable<ApiResponse<CalendarEntry[]>> {
    return this.http.get<ApiResponse<CalendarEntry[]>>(`${environment.apiUrl}/calendar`);
  }

  getDashboard(): Observable<ApiResponse<DashboardResponse>> {
    return this.http.get<ApiResponse<DashboardResponse>>(`${environment.apiUrl}/dashboard`);
  }
}
