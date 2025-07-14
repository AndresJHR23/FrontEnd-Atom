# 📱 Task Manager Frontend

Aplicación de gestión de tareas construida con Angular 17 y Angular Material.

## 🌐 Demo
[https://atomfullstack.web.app](https://atomfullstack.web.app)

## 🛠️ Tecnologías

- **Angular 17** - Standalone Components, Control Flow
- **TypeScript** - Tipado estático
- **Angular Material** - UI Components
- **RxJS** - Programación reactiva
- **XLSX** - Exportación a Excel/CSV

## 🏗️ Arquitectura

### Estructura
src/app/
├── components/    # Componentes standalone
├── services/      # Lógica de negocio
├── models/        # Interfaces TypeScript
├── guards/        # Autenticación
└── environments/  # Configuraciones

### Decisiones Técnicas

**Standalone Components (Angular 17)**
- Eliminan NgModules
- Mejor tree-shaking
- Arquitectura más simple

**State Management con RxJS**
```typescript
private tasksSubject = new BehaviorSubject<Task[]>([]);
public tasks$ = this.tasksSubject.asObservable();

Más simple que NgRx para esta escala
Mantiene reactividad

Guards Funcionales
typescriptexport const authGuard: CanActivateFn = (route, state) => {
  return inject(UserService).authState$.pipe(
    map(auth => auth.isAuthenticated)
  );
};
✨ Funcionalidades
Core

✅ Autenticación por email
✅ CRUD de tareas
✅ Validación de formularios
✅ Estados de carga

Avanzadas

📊 Dashboard con estadísticas
🔍 Filtros y búsqueda en tiempo real
📱 Diseño responsive
📥 Exportación Excel/CSV
🎨 Micro-animaciones

🔧 Configuración
bash# Instalación
npm install

# Desarrollo
ng serve

# Producción
ng build --configuration production
Entornos
typescript// development
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// production  
export const environment = {
  production: true,
  apiUrl: 'https://api-f5gqtp46va-uc.a.run.app/api'
};
💡 Decisiones de Diseño
¿Por qué Angular 17?

Standalone Components reducen complejidad
Mejor performance y tree-shaking
Control Flow syntax más limpio

¿Por qué Angular Material?

Consistencia visual
Accesibilidad built-in
Componentes probados

¿Por qué RxJS?

Ecosistema maduro para HTTP
Operadores potentes
Interoperabilidad con APIs

📊 Métricas

Bundle inicial: ~565KB
TypeScript strict mode: 100%
Lazy loading: Componentes bajo demanda
Memory management: takeUntil pattern

🎯 Highlights
Type Safety
typescriptinterface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
}
Error Handling
typescriptprivate handleError(error: HttpErrorResponse) {
  const message = error.error?.message || 'Error inesperado';
  this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  return throwError(() => new Error(message));
}
Reactive Patterns
typescript// Combinación de filtros en tiempo real
combineLatest([this.searchTerm$, this.filterStatus$, this.tasks$])
  .pipe(
    map(([search, filter, tasks]) => this.applyFilters(tasks, search, filter)),
    takeUntil(this.destroy$)
  )
  .subscribe(filtered => this.filteredTasks = filtered);
