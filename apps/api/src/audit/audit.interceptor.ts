import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service.js';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const { method, url, user } = req;

    return next.handle().pipe(
      tap(() => {
        // Ignorar peticiones de lectura (GET, OPTIONS, HEAD)
        if (['GET', 'OPTIONS', 'HEAD'].includes(method)) return;
        
        // Ignorar módulos que ya tienen auditoría manual o no la necesitan
        if (url.startsWith('/auth') || url.startsWith('/users') || url.startsWith('/audit')) return;

        let action = 'UNKNOWN';
        if (method === 'POST') action = 'CREATE';
        if (method === 'PUT' || method === 'PATCH') action = 'UPDATE';
        if (method === 'DELETE') action = 'DELETE';

        // Obtener el módulo basado en la primera parte de la URL (ej. /products/123 -> PRODUCTS)
        const pathParts = url.split('/').filter(p => p.length > 0 && p !== 'api');
        const moduleName = pathParts.length > 0 ? pathParts[0].toUpperCase() : 'SYSTEM';

        // Solo procesar si hay un usuario logueado (req.user)
        if (user && (user.userId || user.id)) {
          const userId = user.userId || user.id;
          
          let description = `Acción ${action} en módulo ${moduleName}`;
          if (action === 'CREATE') description = `Nuevo registro creado en ${moduleName}`;
          if (action === 'UPDATE') description = `Registro actualizado en ${moduleName}`;
          if (action === 'DELETE') description = `Registro eliminado en ${moduleName}`;

          // Extraer información segura del body (evitar logs gigantes o sensibles)
          const safeBody = { ...req.body };
          delete safeBody.password;
          
          this.auditService.logAction(
            userId,
            moduleName,
            action,
            description,
            { url, body: safeBody },
            req
          ).catch(err => console.error('[AuditInterceptor] Error:', err));
        }
      }),
    );
  }
}
