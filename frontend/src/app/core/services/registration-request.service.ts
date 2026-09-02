import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RegistrationRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class RegistrationRequestService {

  constructor(private http: HttpClient) {}

  getPending(): Observable<RegistrationRequest[]> {
    return this.http.get<RegistrationRequest[]>(
      `${environment.apiUrl}/api/admin/registration-requests/pending`
    );
  }

  approve(id: number): Observable<string> {
  return this.http.put(
    `${environment.apiUrl}/api/admin/registration-requests/${id}/approve`,
    {},
    { responseType: 'text' }
  );
}

reject(id: number): Observable<string> {
  return this.http.put(
    `${environment.apiUrl}/api/admin/registration-requests/${id}/decline`,
    {},
    { responseType: 'text' }
  );
}
}