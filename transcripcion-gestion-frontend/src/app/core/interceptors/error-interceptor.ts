import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const notification = inject(NotificationService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = request.url.includes('/auth/');

      if (error.status === 401 && !isAuthEndpoint) {
        notification.warn(
          'Sesion expirada',
          'Inicia sesion nuevamente para continuar',
        );
        auth.logout();
      } else {
        const detail =
          error.error?.message ?? error.message ?? 'Ocurrio un error inesperado';
        notification.error('Error', detail);
      }

      return throwError(() => error);
    }),
  );
};
