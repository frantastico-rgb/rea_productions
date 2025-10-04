# 🎬 SGP REA PRODUCTIONS - Desarrollo Local

Sistema de Gestión de Producción para REA Productions - Configuración de desarrollo local con Docker.

## 🚀 INICIO RÁPIDO (5 minutos)

### **Nombres de Bases de Datos Configurados:**
- **MySQL:** `sgp_rea_prod`
- **MongoDB:** `sgp_rea_files`

### **Windows (Recomendado):**
```powershell
# 1. Abrir PowerShell como Administrador
# 2. Navegar al directorio del proyecto
cd C:\PYTHON_PROJECTS\REA_PRODUCTIONS

# 3. Ejecutar script de configuración
.\quick-start.ps1
```

### **Linux/Mac:**
```bash
# 1. Hacer ejecutable el script
chmod +x quick-start.sh

# 2. Ejecutar configuración
./quick-start.sh
```

## 📋 PRERREQUISITOS

- **Docker Desktop** (obligatorio)
  - Windows: https://www.docker.com/products/docker-desktop
  - Al menos 4GB RAM disponible
- **PowerShell 5.1+** (Windows)
- **Node.js 18+** (opcional, para desarrollo)

## 🗄️ SERVICIOS INCLUIDOS

| Servicio | Puerto | URL | Usuario | Contraseña |
|----------|--------|-----|---------|------------|
| **MySQL** | 3306 | - | `sgp_user` | `sgp_pass_2025` |
| **PHPMyAdmin** | 8080 | http://localhost:8080 | `sgp_user` | `sgp_pass_2025` |
| **MongoDB** | 27017 | - | `rea_admin` | `rea_mongo_2025` |
| **Mongo Express** | 8081 | http://localhost:8081 | `admin` | `admin` |
| **MinIO Storage** | 9000/9001 | http://localhost:9001 | `rea_storage` | `rea_storage_2025` |
| **MailHog** | 8025 | http://localhost:8025 | - | - |
| **Redis** | 6379 | - | - | `rea_cache_2025` |

## 🔧 CONFIGURACIÓN MANUAL (Si prefieres paso a paso)

### 1. Verificar Docker
```bash
docker --version
docker-compose --version
```

### 2. Crear archivo .env
```bash
# Copiar configuración local
cp .env.local .env
```

### 3. Iniciar servicios
```bash
docker-compose up -d
```

### 4. Verificar servicios
```bash
docker-compose ps
```

## 📊 VERIFICAR INSTALACIÓN

### Acceder a las interfaces:
1. **PHPMyAdmin:** http://localhost:8080
   - Verificar que la base de datos `sgp_rea_prod` tiene ~15 tablas
   - Verificar que hay un usuario `admin` en la tabla `users`

2. **Mongo Express:** http://localhost:8081
   - Verificar que la base de datos `sgp_rea_files` existe
   - Verificar colecciones: `project_files`, `system_logs`, etc.

3. **MinIO:** http://localhost:9001
   - Crear bucket `sgp-files` para almacenamiento

## 🛠️ COMANDOS ÚTILES

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f mysql
docker-compose logs -f mongodb

# Reiniciar un servicio
docker-compose restart mysql

# Detener todos los servicios
docker-compose down

# Limpiar todo (incluyendo datos)
docker-compose down --volumes
```

## 🗃️ ESTRUCTURA DE DATOS

### MySQL (Datos Estructurados)
- **Usuarios y roles** (`users`, `roles`)
- **Proyectos** (`projects`, `scripts`, `scenes`)
- **Talentos** (`talent_profiles`, `auditions`, `contracts`)
- **Patrocinios** (`sponsors`, `sponsorship_deals`) ⚠️ **Crítico**
- **Distribución** (`distribution_platforms`)

### MongoDB (Datos Flexibles)
- **Archivos** (`project_files`) - Metadatos de videos, documentos
- **Logs** (`system_logs`) - Logs del sistema y auditoría
- **Analytics** (`project_analytics`) - Métricas y reportes
- **Configuraciones** (`app_configurations`) - Settings dinámicos

## 🔐 CREDENCIALES DE DESARROLLO

```env
# MySQL 
Host: localhost:3306
Database: sgp_rea_prod
Username: sgp_user
Password: sgp_pass_2025

# MongoDB
URI: mongodb://rea_admin:rea_mongo_2025@localhost:27017/sgp_rea_files

# MinIO (Almacenamiento)
Endpoint: localhost:9000
Access Key: rea_storage
Secret Key: rea_storage_2025

# Redis (Cache)
Host: localhost:6379
Password: rea_cache_2025
```

## 🚨 CARACTERÍSTICAS CRÍTICAS CONFIGURADAS

### ⚠️ **Alertas Automáticas de Vencimiento**
- **Licencias de patrocinio** que vencen en 30, 15, 7 días
- **Contratos** próximos a vencer
- **Notificaciones automáticas** en el sistema

### 🔐 **Seguridad**
- **Auditoría completa** de cambios críticos
- **Roles y permisos** por módulo
- **Separación de datos sensibles** (patrocinio)

### 📊 **Analytics en Tiempo Real**
- **Métricas de producción** (progreso, presupuesto)
- **Reportes financieros** automáticos
- **Dashboard personalizable** por rol

## 🎯 PRÓXIMOS PASOS PARA DESARROLLO

### 1. **Backend API (Node.js + Express)**
```bash
mkdir backend
cd backend
npm init -y
npm install express mysql2 mongoose multer cors dotenv
```

### 2. **Frontend (Vue.js + Vuetify)**
```bash
mkdir frontend
cd frontend
npm create vue@latest .
npm install vuetify @mdi/font axios
```

### 3. **Conectar con Bases de Datos**
- Usar las URLs de conexión del archivo `.env`
- Implementar modelos para MySQL y MongoDB
- Configurar middleware de autenticación

## 🐛 SOLUCIÓN DE PROBLEMAS

### Docker no inicia:
```bash
# Verificar Docker Desktop está corriendo
docker ps

# Limpiar y reiniciar
docker-compose down --volumes
docker system prune -f
.\quick-start.ps1  # Reiniciar
```

### Puertos ocupados:
```bash
# Verificar qué está usando el puerto
netstat -ano | findstr :8080

# Matar proceso si es necesario
taskkill /PID [PID_NUMBER] /F
```

### Base de datos no se inicializa:
```bash
# Ver logs de MySQL
docker-compose logs mysql

# Reiniciar solo MySQL
docker-compose restart mysql
```

## 📞 SOPORTE

- **Logs del sistema:** `docker-compose logs`
- **Estado de servicios:** `docker-compose ps`
- **Verificación automática:** `node verify-setup.js`

---

## 🎬 **¿LISTO PARA EMPEZAR?**

1. **✅ Ejecuta:** `.\quick-start.ps1` (Windows) o `./quick-start.sh` (Linux/Mac)
2. **✅ Verifica:** Accede a http://localhost:8080 (PHPMyAdmin)
3. **✅ Confirma:** Base de datos `sgp_rea_prod` con ~15 tablas creadas
4. **✅ Listo:** ¡Comienza a desarrollar el backend y frontend!

**¿Todo funcionando?** ¡Perfecto! Ahora podemos crear el backend API y el frontend Vue.js.

**¿Algún problema?** Revisa la sección de solución de problemas o ejecuta `node verify-setup.js` para diagnóstico automático.

---

*Sistema de Gestión de Producción REA - Versión de Desarrollo Local v1.0*