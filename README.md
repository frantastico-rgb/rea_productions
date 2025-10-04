# REA Productions - Sistema de Gestión de Proyectos Fílmicos

Sistema completo de gestión de proyectos para producciones cinematográficas. Permite gestionar proyectos, escenas, equipos de trabajo, presupuestos y gastos de manera eficiente.

## Características

### Gestión de Proyectos
- ✅ Crear, listar, actualizar y eliminar proyectos
- ✅ Seguimiento de estados: planificación, en producción, postproducción, completado
- ✅ Control de presupuesto y gastos
- ✅ Fechas de inicio y finalización
- ✅ Búsqueda por nombre o director

### Gestión de Escenas
- ✅ Agregar escenas con número, nombre, locación y duración estimada
- ✅ Marcar escenas como completadas
- ✅ Descripción detallada de cada escena
- ✅ Eliminar escenas

### Gestión de Equipo
- ✅ Agregar miembros del equipo con roles específicos
- ✅ Información de contacto (email, teléfono)
- ✅ Listado completo del equipo por proyecto

### Control Presupuestario
- ✅ Registro de gastos por proyecto
- ✅ Cálculo automático de presupuesto restante
- ✅ Alertas de sobrecostos
- ✅ Estadísticas globales de presupuestos

### Persistencia de Datos
- ✅ Almacenamiento automático en formato JSON
- ✅ Carga automática al iniciar la aplicación

## Instalación

### Requisitos
- Python 3.7 o superior

### Configuración
```bash
# Clonar el repositorio
git clone https://github.com/frantastico-rgb/rea_productions.git
cd rea_productions

# No se requieren dependencias externas
# El sistema usa solo la biblioteca estándar de Python
```

## Uso

### Iniciar la aplicación
```bash
python app.py
```

### Menú Principal
El sistema presenta un menú interactivo con las siguientes opciones:

```
1. Crear nuevo proyecto
2. Listar proyectos
3. Ver detalles de proyecto
4. Actualizar proyecto
5. Eliminar proyecto
6. Gestionar escenas
7. Gestionar equipo
8. Registrar gasto
9. Ver estadísticas
0. Salir
```

### Ejemplos de Uso

#### Crear un Proyecto
```
Opción: 1
Nombre: "El Último Amanecer"
Director: "María González"
Presupuesto: 150000
Fecha inicio: 2024-03-01
Fecha fin: 2024-10-31
```

#### Agregar una Escena
```
Opción: 6
ID del proyecto: 1
Opción: 1 (Agregar escena)
Número: 1
Nombre: "Escena de apertura"
Locación: "Playa al amanecer"
Duración: 45
Descripción: "Primera escena que establece el tono"
```

#### Agregar Miembro al Equipo
```
Opción: 7
ID del proyecto: 1
Opción: 1 (Agregar miembro)
Nombre: "Carlos Ruiz"
Rol: "Director de Fotografía"
Email: "carlos@example.com"
Teléfono: "555-1234"
```

#### Registrar un Gasto
```
Opción: 8
ID del proyecto: 1
Monto: 15000
```

## Estructura del Proyecto

```
rea_productions/
├── app.py              # Interfaz de línea de comandos
├── gestor.py           # Lógica de negocio y operaciones CRUD
├── proyecto.py         # Modelos de datos (Proyecto, Escena, Miembro)
├── test_sistema.py     # Suite completa de pruebas
├── requirements.txt    # Dependencias (ninguna externa requerida)
├── .gitignore          # Archivos ignorados por Git
└── README.md           # Este archivo
```

## Arquitectura

### Modelos de Datos

#### Proyecto
- `id`: Identificador único
- `nombre`: Nombre del proyecto
- `director`: Director del proyecto
- `presupuesto`: Presupuesto total
- `gastos`: Gastos acumulados
- `fecha_inicio`: Fecha de inicio
- `fecha_fin`: Fecha de finalización
- `estado`: Estado actual (planificacion, en_produccion, postproduccion, completado)
- `escenas`: Lista de escenas
- `equipo`: Lista de miembros del equipo

#### Escena
- `numero`: Número de escena
- `nombre`: Nombre de la escena
- `locacion`: Locación de filmación
- `duracion_estimada`: Duración en minutos
- `descripcion`: Descripción detallada
- `completada`: Estado de completitud

#### Miembro
- `nombre`: Nombre del miembro
- `rol`: Rol en la producción
- `email`: Email de contacto
- `telefono`: Teléfono de contacto

### Persistencia
Los datos se almacenan en formato JSON en el archivo `proyectos.json`, que se crea automáticamente al guardar el primer proyecto.

## Testing

El sistema incluye una suite completa de pruebas unitarias:

```bash
# Ejecutar todas las pruebas
python -m unittest test_sistema.py -v

# O con pytest si está instalado
pytest test_sistema.py -v
```

### Cobertura de Pruebas
- ✅ 30 tests unitarios
- ✅ Cobertura completa de modelos de datos
- ✅ Pruebas de operaciones CRUD
- ✅ Validación de persistencia de datos
- ✅ Pruebas de casos límite y errores

## Flujo de Trabajo Típico

1. **Iniciar aplicación**: `python app.py`
2. **Crear proyecto**: Opción 1, ingresar datos del proyecto
3. **Agregar escenas**: Opción 6, agregar todas las escenas planificadas
4. **Agregar equipo**: Opción 7, registrar miembros del equipo
5. **Cambiar estado**: Opción 4, actualizar estado a "en_produccion"
6. **Registrar gastos**: Opción 8, registrar gastos a medida que ocurren
7. **Marcar escenas completadas**: Opción 6, marcar escenas filmadas
8. **Monitorear progreso**: Opción 3 y 9, revisar detalles y estadísticas
9. **Finalizar proyecto**: Opción 4, cambiar estado a "completado"

## Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Contacto

Para preguntas, sugerencias o reportar problemas, por favor abre un issue en el repositorio de GitHub.
