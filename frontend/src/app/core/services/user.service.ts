import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AppUser, UserRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {

  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<AppUser[]>> {
    return this.http.get<ApiResponse<AppUser[]>>(this.baseUrl);
  }

  create(request: UserRequest): Observable<ApiResponse<AppUser>> {
    return this.http.post<ApiResponse<AppUser>>(this.baseUrl, request);
  }

  update(id: number, request: UserRequest): Observable<ApiResponse<AppUser>> {
    return this.http.put<ApiResponse<AppUser>>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
