# 🚀 Sistema de Gestión de Ventas e Inventario - Studio

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

Una solución ERP moderna, robusta y escalable diseñada para la gestión integral de puntos de venta (POS) e inventarios. Este sistema ofrece una experiencia de usuario premium con un enfoque en la eficiencia operativa y el análisis de datos en tiempo real.

## ✨ Características Principales

### 💳 Terminal Punto de Venta (POS)
- **Interfaz Intuitiva**: Carrito de compras dinámico con búsqueda rápida de productos.
- **Gestión de Clientes**: Asignación rápida de ventas a clientes registrados o invitados.
- **Múltiples Métodos de Pago**: Soporte para efectivo, tarjeta y transferencias.
- **Generación de Documentos**: Creación automática de series y correlativos para comprobantes.

### 📦 Gestión de Inventario (Inventory Studio)
- **Control de Stock Atómico**: Seguimiento automático de cada unidad.
- **Trazabilidad Total**: Registro de movimientos (IN/OUT) con motivos de ajuste.
- **Cálculo de Márgenes**: Visualización en tiempo real del margen de ganancia estimado basado en costos de compra vs precios de venta.
- **Alertas de Bajo Stock**: Indicadores visuales para productos que requieren reabastecimiento.

### 📊 Historial de Ventas y Auditoría
- **Filtrado Avanzado**: Búsqueda por rango de fechas, estado de pago y series.
- **Anulación con Reversión**: Proceso seguro de cancelación de ventas que restaura automáticamente el stock al inventario.
- **Detalle Extendido**: Visualización completa de cada transacción, incluyendo ítems, impuestos y usuario responsable.

### 🔐 Seguridad y Autenticación
- **JWT Authentication**: Sistema basado en tokens para sesiones seguras.
- **Roles y Permisos**: Control de acceso granular para Administradores y Vendedores.

## 🛠️ Stack Tecnológico

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: [NestJS 11](https://nestjs.com/) con arquitectura modular.
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) con [Prisma ORM](https://www.prisma.io/).
- **Monorepo**: Gestión eficiente de paquetes compartidos.

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/JorgeTorres1994/sistema_ventas_nextjs.git
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env` en `apps/api` con tu `DATABASE_URL` y `JWT_SECRET`.

4. **Ejecutar Migraciones y Semilla**:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

5. **Iniciar en Desarrollo**:
   ```bash
   npm run dev:web
   ```

## 📈 Próximos Pasos
- [ ] Implementación de Reportes Financieros en PDF.
- [ ] Integración con Facturación Electrónica.
- [ ] Dashboard de Analítica Predictiva.

---

Desarrollado con ❤️ para **Jorge Torres**.
