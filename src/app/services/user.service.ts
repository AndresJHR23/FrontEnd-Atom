import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, CreateUserRequest } from '../models/user.model';
import { AuthState } from '../models/auth-state.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserFromStorage();
  }

  findByEmail(email: string): Observable<User | null> {
    this.setLoading(true);
    return this.apiService.get<User>(`/users/${encodeURIComponent(email)}`)
      .pipe(
        map(response => response.data || null),
        tap(() => this.setLoading(false))
      );
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    this.setLoading(true);
    return this.apiService.post<User>('/users', userData)
      .pipe(
        map(response => response.data!),
        tap(user => {
          this.setCurrentUser(user);
          this.setLoading(false);
        })
      );
  }

  setCurrentUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.authStateSubject.next({
      user,
      isAuthenticated: true,
      loading: false
    });
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.authStateSubject.next({
      user: null,
      isAuthenticated: false,
      loading: false
    });
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.authStateSubject.next({
            user,
            isAuthenticated: true,
            loading: false
          });
        } catch {
          localStorage.removeItem('currentUser');
        }
      }
    }
  }

  private setLoading(loading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      loading
    });
  }
}