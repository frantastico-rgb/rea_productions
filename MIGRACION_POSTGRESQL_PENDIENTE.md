# 🔄 MIGRACIÓN POSTGRESQL - TAREAS PENDIENTES

**Fecha:** 8 de Diciembre 2025  
**Estado:** Base de datos creada, código 50% migrado  
**Próxima sesión:** Completar migración y deploy

---

## ✅ COMPLETADO HOY

### 1. Instalación PostgreSQL
- ✅ PostgreSQL 16 instalado en Windows
- ✅ Servicio corriendo: `postgresql-x64-16`
- ✅ Puerto: 5432
- ✅ Usuario: `postgres`
- ✅ Contraseña: `admin123`

### 2. Base de Datos Creada
- ✅ Nombre: `sgp_rea_prod`
- ✅ Encoding: UTF8
- ✅ 16 tablas creadas exitosamente

**Tablas creadas:**
```
✅ roles                    ✅ scenes
✅ users                    ✅ scripts  
✅ projects                 ✅ characters
✅ talent_profiles          ✅ scene_characters
✅ auditions                ✅ user_sessions
✅ contracts                ✅ audit_log
✅ sponsors                 ✅ system_notifications
✅ sponsorship_deals        ✅ distribution_platforms
```

### 3. Dependencias Instaladas
- ✅ `pg` (PostgreSQL driver para Node.js)
- ✅ 13 paquetes adicionales instalados
- ✅ Total: 598 paquetes auditados

### 4. Código Actualizado (Parcial)
- ✅ Importación cambiada: `mysql2` → `pg`
- ✅ Función `getPostgreSQLConnection()` creada
- ✅ Todas las llamadas a `getMySQLConnection` actualizadas

---

## 🔧 PENDIENTE: Actualizar Sintaxis SQL

### Problema Principal
PostgreSQL usa sintaxis diferente a MySQL para consultas SQL.

### Cambios Necesarios en `server.js`

#### 1️⃣ Parámetros de Consulta
**Afecta:** 14 endpoints (líneas: 557, 720, 772, 810, 883, 933, 966, 1032, 1095, 1161, 1198, 1264, 1327, 1393)

```javascript
// ❌ MySQL (actual):
const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ? AND status = ?', 
    [userId, status]
);

// ✅ PostgreSQL (necesario):
const result = await pool.query(
    'SELECT * FROM users WHERE id = $1 AND status = $2', 
    [userId, status]
);
const rows = result.rows;
```

**Patrón de búsqueda/reemplazo:**
- Buscar: `?` (placeholders)
- Reemplazar: `$1, $2, $3, $4...` (numerar en orden)

#### 2️⃣ Estructura de Respuesta

```javascript
// ❌ MySQL retorna: [rows, fields]
const [users] = await pool.query('SELECT...');
const [result] = await pool.query('INSERT...');

// ✅ PostgreSQL retorna: { rows, fields, rowCount, ... }
const { rows: users } = await pool.query('SELECT...');
// O bien:
const result = await pool.query('SELECT...');
const users = result.rows;
```

#### 3️⃣ INSERT con ID Generado

```javascript
// ❌ MySQL:
const [result] = await pool.query(
    'INSERT INTO projects (title, status) VALUES (?, ?)',
    [title, status]
);
const newId = result.insertId;

// ✅ PostgreSQL:
const result = await pool.query(
    'INSERT INTO projects (title, status) VALUES ($1, $2) RETURNING id',
    [title, status]
);
const newId = result.rows[0].id;
```

**Agregar `RETURNING id`** a todos los INSERT que necesiten el ID generado.

#### 4️⃣ UPDATE y DELETE con Confirmación

```javascript
// ❌ MySQL:
const [result] = await pool.query('UPDATE projects SET...');
if (result.affectedRows === 0) { /* no encontrado */ }

// ✅ PostgreSQL:
const result = await pool.query('UPDATE projects SET...');
if (result.rowCount === 0) { /* no encontrado */ }
```

**Cambiar:** `affectedRows` → `rowCount`

---

## 📊 PENDIENTE: Migrar Datos de MySQL

### Datos Actuales en MySQL

```sql
-- 6 ROLES (ya están en PostgreSQL via schema inicial)
-- No migrar, ya existen

-- 1 USUARIO
INSERT INTO users (id, username, email, password_hash, role_id, first_name, last_name, is_active)
VALUES (
    1,
    'admin',
    'admin@rea.com',
    '$2b$10$HASH_GENERADO_CON_BCRYPT',
    1,
    'Admin',
    'Sistema',
    true
);

-- 1 PROYECTO
INSERT INTO projects (id, title, description, status, project_type, created_by)
VALUES (
    5,
    'proyecto de prueba final',
    'Descripción del proyecto',
    'desarrollo',
    'cine',
    1
);

-- 1 SCRIPT
INSERT INTO scripts (id, project_id, title, version, created_by)
VALUES (
    5,
    5,
    'Script prueba',
    '1.0',
    1
);

-- 1 ESCENA
INSERT INTO scenes (id, script_id, scene_number, location, time_of_day)
VALUES (
    1,
    5,
    1,
    'Interior oficina',
    'dia'
);
```

### Método de Migración

**Opción 1: Manual (recomendado para pocos datos)**
1. Abrir pgAdmin
2. Conectar a `sgp_rea_prod`
3. Query Tool → pegar INSERT statements
4. Ejecutar

**Opción 2: Exportar/Importar**
```bash
# Exportar de MySQL
mysqldump -u root sgp_rea_prod > mysql_backup.sql

# Convertir sintaxis (manual o con herramienta)
# Importar a PostgreSQL
psql -U postgres -d sgp_rea_prod -f postgresql_data.sql
```

---

## 🔄 PENDIENTE: Variables de Entorno

### Archivo `.env.local` (Crear/Actualizar)

```env
# ========================================
# POSTGRESQL - LOCAL
# ========================================
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/sgp_rea_prod

# ========================================
# MONGODB ATLAS
# ========================================
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/sgp_rea_files?retryWrites=true&w=majority

# ========================================
# SESIONES
# ========================================
SESSION_SECRET=tu_session_secret_seguro

# ========================================
# SERVIDOR
# ========================================
PORT=3000
NODE_ENV=development

# ========================================
# CORS (opcional)
# ========================================
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Variables para Render (Producción)

En Render Dashboard → Settings → Environment:

```env
DATABASE_URL=postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/sgp_rea_prod_xxxx
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=produccion_secret_fuerte
NODE_ENV=production
PORT=10000
```

---

## 🧪 PENDIENTE: Pruebas Locales

### Checklist de Testing

```
Servidor:
⬜ node server.js inicia sin errores
⬜ PostgreSQL conecta exitosamente
⬜ MongoDB conecta exitosamente

Autenticación:
⬜ Login funciona (admin/admin123)
⬜ Sesión persiste
⬜ Logout funciona
⬜ Redirección a login sin sesión

Proyectos:
⬜ GET /api/projects - Lista proyectos
⬜ GET /api/projects/:id - Ver proyecto individual
⬜ POST /api/projects - Crear proyecto
⬜ PUT /api/projects/:id - Editar proyecto
⬜ DELETE /api/projects/:id - Eliminar proyecto

Scripts:
⬜ GET /api/scripts - Lista scripts
⬜ POST /api/scripts - Crear script
⬜ Relación project_id funciona

Escenas:
⬜ GET /api/scenes - Lista escenas
⬜ POST /api/scenes - Crear escena
⬜ Relación script_id funciona

UI:
⬜ Botón VER muestra estadísticas
⬜ Dashboard carga correctamente
⬜ No errores en consola del navegador
```

### URLs de Prueba

```
http://localhost:3000/login.html
http://localhost:3000/dashboard.html
http://localhost:3000/api/projects
http://localhost:3000/api/projects/5
```

---

## 🚀 PENDIENTE: Deployment a Render

### Paso 1: Crear PostgreSQL en Render

1. Login → https://dashboard.render.com
2. New → PostgreSQL
3. Configuración:
   - **Name:** `rea-productions-db`
   - **Database:** `sgp_rea_prod_render`
   - **User:** (auto-generado)
   - **Region:** Oregon (US West)
   - **Plan:** Free (1 GB)
4. Create Database
5. **Copiar Internal Database URL** → Usar como `DATABASE_URL`

### Paso 2: Ejecutar Schema en PostgreSQL Render

**Opción A: Desde Local (recomendado)**
```bash
# Conectar desde tu computadora
psql "postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/sgp_rea_prod_xxxx" -f database_setup_postgresql.sql
```

**Opción B: Desde pgAdmin**
1. New Server → Name: "Render PostgreSQL"
2. Connection:
   - Host: `dpg-xxxxx.oregon-postgres.render.com`
   - Port: 5432
   - Database: `sgp_rea_prod_xxxx`
   - Username: (de Render)
   - Password: (de Render)
3. Query Tool → Abrir `database_setup_postgresql.sql`
4. Execute

### Paso 3: Configurar Variables en Render Web Service

Dashboard → `rea_productions` → Environment:

```
DATABASE_URL = postgresql://user:pass@host:5432/db
MONGODB_URI = mongodb+srv://...
SESSION_SECRET = produccion_secret_123
NODE_ENV = production
```

### Paso 4: Push Código a GitHub

```bash
cd "c:\Users\USUARIO\Desktop\TOTAL NUEVO 2.0\sena  2.0\ADSO\desarrollo SOFTWARE\HOSTINGER\REA_DEMO\rea_productions"

# Ver cambios
git status

# Agregar archivos
git add server.js
git add database_setup_postgresql.sql
git add .env.local
git add package.json package-lock.json

# Commit
git commit -m "feat: Migración completa a PostgreSQL para producción"

# Push
git push origin main
```

### Paso 5: Verificar Deployment

1. Render detecta push automáticamente
2. Inicia build (2-3 minutos)
3. Deploy automático
4. Verificar logs: `✅ PostgreSQL conectado`

### Paso 6: Probar en Producción

```
https://rea-productions.onrender.com/login.html
Usuario: admin
Contraseña: admin123
```

**Checklist:**
```
⬜ Login funciona
⬜ Dashboard carga
⬜ Proyectos se listan
⬜ Crear proyecto funciona
⬜ Editar proyecto funciona
⬜ Botón VER funciona
⬜ No errores en logs de Render
```

---

## 📝 PRÓXIMA SESIÓN: Plan de Acción

### Tiempo Estimado: 1-1.5 horas

#### Fase 1: Actualizar Sintaxis SQL (30-45 min)
```
1. Buscar todos los `?` en queries
2. Reemplazar por $1, $2, $3...
3. Cambiar [rows] por result.rows
4. Agregar RETURNING id en INSERT
5. Cambiar affectedRows por rowCount
```

#### Fase 2: Migrar Datos (5-10 min)
```
1. Abrir pgAdmin
2. Conectar a sgp_rea_prod
3. Ejecutar INSERT de usuario admin
4. Ejecutar INSERT de proyecto, script, escena
5. Verificar con SELECT
```

#### Fase 3: Pruebas Locales (10-15 min)
```
1. node server.js
2. Ir a http://localhost:3000/login.html
3. Login con admin/admin123
4. Probar CRUD de proyectos
5. Verificar botón VER
```

#### Fase 4: Configurar Render PostgreSQL (10 min)
```
1. Crear database en Render
2. Copiar DATABASE_URL
3. Ejecutar schema remoto
4. Configurar variables de entorno
```

#### Fase 5: Deploy y Pruebas (15 min)
```
1. git add, commit, push
2. Esperar build en Render
3. Probar producción
4. Verificar logs
5. ✅ Celebrar migración exitosa
```

---

## 💾 ESTADO ACTUAL DEL PROYECTO

### Bases de Datos

```
✅ MongoDB Atlas
   - Estado: Funcionando
   - Uso: Archivos (GridFS)
   - Conexión: Exitosa
   - Colecciones: 4

🟡 PostgreSQL Local
   - Estado: Instalado, tablas creadas
   - Base de datos: sgp_rea_prod
   - Tablas: 16/16 ✅
   - Datos: Pendiente migrar
   - Código: 50% actualizado

❌ MySQL
   - Estado: Será reemplazado
   - Datos: 1 usuario, 1 proyecto, 1 script, 1 escena
   - Acción: Exportar y migrar
```

### Archivos Modificados (Sin Commit)

```
📝 server.js
   - Líneas 17: mysql2 → pg
   - Líneas 140-167: Función PostgreSQL
   - Líneas 557-1393: 14 endpoints (pendiente sintaxis)

📝 database_setup_postgresql.sql
   - Línea 17: Removido \c sgp_rea_prod
   - Estado: Listo para uso

📝 package.json, package-lock.json
   - Dependencia pg agregada
```

---

## 🔑 CREDENCIALES IMPORTANTES

### PostgreSQL Local
```
Host: localhost
Port: 5432
Database: sgp_rea_prod
User: postgres
Password: admin123
```

### Aplicación Web
```
Usuario: admin
Password: admin123
```

### MongoDB Atlas
```
Conectado desde: MONGODB_URI en .env.local
Base de datos: sgp_rea_files
```

### Render
```
URL: https://rea-productions.onrender.com
Repositorio: frantastico-rgb/rea_productions
Branch: main
Auto-deploy: Activado
```

---

## 📚 RECURSOS ÚTILES

### Documentación
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node.js pg driver: https://node-postgres.com/
- Render PostgreSQL: https://render.com/docs/databases

### Comandos PostgreSQL Útiles

```sql
-- Ver todas las tablas
\dt

-- Ver estructura de tabla
\d users

-- Ver datos
SELECT * FROM users;
SELECT * FROM projects;

-- Contar registros
SELECT COUNT(*) FROM users;

-- Eliminar datos (cuidado)
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
```

### Comandos Git

```bash
# Ver estado
git status

# Ver diferencias
git diff server.js

# Deshacer cambios (cuidado)
git checkout -- server.js

# Ver log
git log --oneline -10
```

---

## ⚠️ NOTAS IMPORTANTES

### Diferencias MySQL vs PostgreSQL

| Característica | MySQL | PostgreSQL |
|---|---|---|
| Placeholders | `?` | `$1, $2, $3` |
| Resultado query | `[rows, fields]` | `{ rows, fields }` |
| Auto-increment | `AUTO_INCREMENT` | `SERIAL` |
| Retornar ID | `insertId` | `RETURNING id` |
| Filas afectadas | `affectedRows` | `rowCount` |
| Fecha/hora | `DATETIME` | `TIMESTAMP` |
| JSON | `JSON` | `JSONB` |

### Errores Comunes a Evitar

1. ❌ Olvidar cambiar `?` por `$1`
   ```javascript
   // Error:
   pool.query('SELECT * FROM users WHERE id = ?', [1])
   
   // Correcto:
   pool.query('SELECT * FROM users WHERE id = $1', [1])
   ```

2. ❌ No extraer `.rows` del resultado
   ```javascript
   // Error:
   const [users] = await pool.query('SELECT...')
   
   // Correcto:
   const { rows: users } = await pool.query('SELECT...')
   ```

3. ❌ Olvidar `RETURNING id` en INSERT
   ```javascript
   // Error:
   const result = await pool.query('INSERT...')
   const id = result.insertId // undefined
   
   // Correcto:
   const result = await pool.query('INSERT... RETURNING id')
   const id = result.rows[0].id
   ```

---

## 🎯 OBJETIVO FINAL

**Tener la aplicación completamente funcional en Render con:**
- ✅ PostgreSQL para datos relacionales
- ✅ MongoDB para archivos
- ✅ Autenticación funcionando
- ✅ CRUD completo de proyectos/scripts/escenas
- ✅ Deploy automático desde GitHub
- ✅ Sin errores en producción

---

**Archivo creado:** 8 de Diciembre 2025  
**Para:** Sesión del 9 de Diciembre 2025  
**Próximo paso:** Actualizar sintaxis SQL en server.js
