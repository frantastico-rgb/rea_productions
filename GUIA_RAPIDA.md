# Guía Rápida - Sistema de Gestión de Proyectos Fílmicos

## Inicio Rápido

### 1. Ejecutar la aplicación
```bash
python app.py
```

### 2. Ejecutar demostración
```bash
python demo.py
```

### 3. Ejecutar tests
```bash
python -m unittest test_sistema.py -v
```

## Flujo de Trabajo Básico

### Crear un Proyecto
1. Menú principal → Opción 1
2. Ingresar: nombre, director, presupuesto, fechas

### Agregar Escenas
1. Menú principal → Opción 6
2. Seleccionar ID del proyecto
3. Opción 1 (Agregar escena)
4. Ingresar: número, nombre, locación, duración

### Agregar Equipo
1. Menú principal → Opción 7
2. Seleccionar ID del proyecto
3. Opción 1 (Agregar miembro)
4. Ingresar: nombre, rol, email, teléfono

### Registrar Gastos
1. Menú principal → Opción 8
2. Seleccionar ID del proyecto
3. Ingresar monto del gasto

### Ver Estadísticas
1. Menú principal → Opción 9
2. Ver resumen de todos los proyectos

## Estados del Proyecto

- **planificacion**: Proyecto en fase de planificación
- **en_produccion**: Proyecto en producción activa
- **postproduccion**: Proyecto en postproducción
- **completado**: Proyecto finalizado

## Archivos Importantes

- `proyecto.py`: Modelos de datos (Proyecto, Escena, Miembro)
- `gestor.py`: Lógica de negocio y operaciones CRUD
- `app.py`: Interfaz de línea de comandos
- `test_sistema.py`: Suite de pruebas
- `demo.py`: Script de demostración
- `proyectos.json`: Almacenamiento de datos (se crea automáticamente)

## Funcionalidades Principales

### Gestión de Proyectos
- ✓ Crear, listar, actualizar, eliminar
- ✓ Buscar por nombre o director
- ✓ Filtrar por estado

### Gestión de Escenas
- ✓ Agregar/eliminar escenas
- ✓ Marcar como completadas
- ✓ Descripción detallada

### Gestión de Equipo
- ✓ Agregar miembros
- ✓ Roles y contactos
- ✓ Listar equipo completo

### Control Presupuestario
- ✓ Registro de gastos
- ✓ Cálculo de saldo
- ✓ Alertas de sobrecosto
- ✓ Estadísticas globales

## Ejemplo de Uso Programático

```python
from gestor import GestorProyectos
from proyecto import Escena, Miembro

# Crear gestor
gestor = GestorProyectos()

# Crear proyecto
proyecto = gestor.crear_proyecto(
    nombre="Mi Película",
    director="Juan Pérez",
    presupuesto=100000,
    fecha_inicio="2024-01-01"
)

# Agregar escena
escena = Escena(1, "Apertura", "Playa", 30)
proyecto.agregar_escena(escena)

# Agregar miembro
miembro = Miembro("Ana López", "Actriz")
proyecto.agregar_miembro(miembro)

# Registrar gasto
proyecto.registrar_gasto(5000)

# Guardar cambios
gestor.guardar_datos()
```

## Soporte

Para problemas o preguntas, abrir un issue en GitHub:
https://github.com/frantastico-rgb/rea_productions/issues
