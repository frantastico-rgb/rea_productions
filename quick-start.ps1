# 🚀 SCRIPT DE INICIO RÁPIDO - SGP REA PRODUCTIONS (Windows)
# Archivo: quick-start.ps1
# Propósito: Configurar y ejecutar el entorno de desarrollo local en Windows

param(
    [switch]$Clean = $false,
    [switch]$Help = $false
)

# Colores para output
$Colors = @{
    Red    = "Red"
    Green  = "Green"
    Yellow = "Yellow"
    Blue   = "Blue"
    Cyan   = "Cyan"
    Magenta = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Prefix = ""
    )
    
    if ($Prefix) {
        Write-Host "[$Prefix] " -ForegroundColor $Color -NoNewline
    }
    Write-Host $Message -ForegroundColor $Color
}

function Write-Status { param([string]$Message) Write-ColorOutput $Message "Blue" "INFO" }
function Write-Success { param([string]$Message) Write-ColorOutput $Message "Green" "SUCCESS" }
function Write-Warning { param([string]$Message) Write-ColorOutput $Message "Yellow" "WARNING" }
function Write-Error { param([string]$Message) Write-ColorOutput $Message "Red" "ERROR" }
function Write-Header { param([string]$Message) Write-ColorOutput $Message "Cyan" }

# Mostrar ayuda
if ($Help) {
    Write-Host @"
🎬 SGP REA PRODUCTIONS - SCRIPT DE INICIO RÁPIDO

USO:
    .\quick-start.ps1                 # Inicio normal
    .\quick-start.ps1 -Clean          # Limpiar y reiniciar todo
    .\quick-start.ps1 -Help           # Mostrar esta ayuda

DESCRIPCIÓN:
    Este script configura un entorno completo de desarrollo local usando Docker:
    - MySQL 8.0 (Base de datos principal)
    - MongoDB 7.0 (Archivos y metadatos)
    - MinIO (Almacenamiento de archivos)
    - Redis (Cache y sesiones)
    - MailHog (Testing de emails)
    - PHPMyAdmin y Mongo Express (Interfaces de administración)

PRERREQUISITOS:
    - Docker Desktop para Windows
    - PowerShell 5.1 o superior
    - Al menos 4GB de RAM disponible

PUERTOS UTILIZADOS:
    3306  - MySQL
    27017 - MongoDB
    6379  - Redis
    9000  - MinIO API
    9001  - MinIO Console
    8080  - PHPMyAdmin
    8081  - Mongo Express
    8025  - MailHog
"@
    exit 0
}

# Banner de inicio
Write-Host "`n" -NoNewline
Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput "🎬 SGP REA PRODUCTIONS - INICIO RÁPIDO" "Cyan"
Write-ColorOutput "===============================================" "Cyan"
Write-Host ""

# Verificar prerrequisitos
Write-Header "📋 VERIFICANDO PRERREQUISITOS..."

# Verificar PowerShell version
$PSVersion = $PSVersionTable.PSVersion
if ($PSVersion.Major -lt 5) {
    Write-Error "Se requiere PowerShell 5.0 o superior. Versión actual: $PSVersion"
    exit 1
}
Write-Success "PowerShell versión: $PSVersion"

# Verificar Docker
try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) {
        throw "Docker no encontrado"
    }
    Write-Success "Docker encontrado: $dockerVersion"
} catch {
    Write-Error "Docker no está instalado o no está en el PATH."
    Write-Warning "Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
    exit 1
}

# Verificar Docker Compose
try {
    $composeVersion = docker-compose --version 2>$null
    if ($composeVersion) {
        $DockerCompose = "docker-compose"
        Write-Success "Docker Compose encontrado: $composeVersion"
    } else {
        # Intentar con docker compose (nueva sintaxis)
        docker compose version 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $DockerCompose = "docker compose"
            Write-Success "Docker Compose (plugin) encontrado"
        } else {
            throw "Docker Compose no encontrado"
        }
    }
} catch {
    Write-Error "Docker Compose no está disponible."
    exit 1
}

# Verificar Docker está corriendo
try {
    docker ps 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está corriendo"
    }
    Write-Success "Docker daemon está corriendo"
} catch {
    Write-Error "Docker Desktop no está ejecutándose. Por favor inicia Docker Desktop."
    exit 1
}

# Verificar Node.js (opcional)
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Success "Node.js encontrado: $nodeVersion"
    } else {
        Write-Warning "Node.js no encontrado. Se recomienda para desarrollo."
    }
} catch {
    Write-Warning "Node.js no está instalado. Se recomienda para desarrollo del backend/frontend."
}

# Crear estructura de directorios
Write-Status "Creando estructura de directorios..."
$directories = @("mysql-config", "logs", "uploads", "backups", "data")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Status "Directorio creado: $dir"
    }
}

# Crear configuración MySQL
Write-Status "Creando configuración MySQL..."
$mysqlConfig = @"
[mysqld]
# Configuración para desarrollo local
max_connections=200
innodb_buffer_pool_size=256M
innodb_log_file_size=64M
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO

# Configuración de timezone
default-time-zone='-05:00'

# Configuración de charset
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# Configuración de logs
general_log=1
general_log_file=/var/log/mysql/general.log
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow.log
long_query_time=2

[mysql]
default-character-set=utf8mb4

[client]
default-character-set=utf8mb4
"@

$mysqlConfig | Out-File -FilePath "mysql-config\mysql.cnf" -Encoding UTF8
Write-Success "Configuración MySQL creada"

# Configurar variables de entorno
Write-Status "Configurando variables de entorno..."
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.local") {
        Copy-Item ".env.local" ".env"
        Write-Success "Archivo .env creado desde .env.local"
    } else {
        Write-Warning "Archivo .env.local no encontrado. Creando .env básico..."
        $envContent = @"
NODE_ENV=development
MYSQL_DATABASE=sgp_rea_prod
MONGODB_DATABASE=sgp_rea_files
JWT_SECRET=desarrollo_local_jwt_secret_2025
"@
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
    }
} else {
    Write-Status "Archivo .env ya existe"
}

# Limpiar instalación anterior si se solicita
if ($Clean) {
    Write-Header "🧹 LIMPIANDO INSTALACIÓN ANTERIOR..."
    Write-Status "Deteniendo contenedores existentes..."
    
    try {
        & $DockerCompose.Split() down --volumes --remove-orphans 2>$null
    } catch {
        Write-Warning "No hay contenedores previos para limpiar"
    }
    
    Write-Status "Limpiando volúmenes no utilizados..."
    docker system prune -f --volumes 2>$null | Out-Null
}

# Iniciar servicios
Write-Header "🚀 INICIANDO SERVICIOS..."
Write-Status "Descargando imágenes Docker (esto puede tomar unos minutos la primera vez)..."

try {
    & $DockerCompose.Split() up -d --build
    if ($LASTEXITCODE -ne 0) {
        throw "Error al iniciar servicios"
    }
} catch {
    Write-Error "Error al iniciar los servicios Docker"
    Write-Status "Mostrando logs para diagnóstico..."
    & $DockerCompose.Split() logs
    exit 1
}

# Función para esperar servicios
function Wait-ForService {
    param(
        [string]$ServiceName,
        [int]$MaxAttempts = 30,
        [int]$SleepSeconds = 5
    )
    
    $attempt = 1
    while ($attempt -le $MaxAttempts) {
        $status = & $DockerCompose.Split() ps $ServiceName 2>$null
        if ($status -match "healthy|Up") {
            Write-Success "$ServiceName está listo"
            return $true
        }
        Write-Status "Esperando $ServiceName... (intento $attempt/$MaxAttempts)"
        Start-Sleep -Seconds $SleepSeconds
        $attempt++
    }
    
    Write-Error "$ServiceName no está listo después de $MaxAttempts intentos"
    return $false
}

# Esperar servicios críticos
Write-Status "Esperando a que los servicios estén listos..."
$servicesReady = $true

if (-not (Wait-ForService "mysql")) { $servicesReady = $false }
if (-not (Wait-ForService "mongodb")) { $servicesReady = $false }

if (-not $servicesReady) {
    Write-Error "Algunos servicios no iniciaron correctamente"
    Write-Status "Mostrando estado de servicios:"
    & $DockerCompose.Split() ps
    exit 1
}

# Verificar inicialización de base de datos
Write-Status "Verificando inicialización de bases de datos..."
Start-Sleep -Seconds 10

# Crear bucket en MinIO si es necesario
Write-Status "Configurando almacenamiento MinIO..."
Start-Sleep -Seconds 5

# Mostrar estado final
Write-Header "📊 ESTADO DE SERVICIOS:"
& $DockerCompose.Split() ps

# Mostrar URLs de acceso
Write-Header "🌐 URLS DE ACCESO:"
Write-Success "Servicios principales:"
Write-Host "   🗄️  MySQL Admin (PHPMyAdmin):    http://localhost:8080" -ForegroundColor Green
Write-Host "   📊 MongoDB Admin (Mongo Express): http://localhost:8081" -ForegroundColor Green
Write-Host "   💾 Almacenamiento (MinIO):        http://localhost:9001" -ForegroundColor Green
Write-Host "   📧 Email Testing (MailHog):       http://localhost:8025" -ForegroundColor Green
Write-Host ""
Write-ColorOutput "Para desarrollo:" "Blue"
Write-Host "   🏗️  Backend API:                  http://localhost:3000" -ForegroundColor Blue
Write-Host "   🎨 Frontend Vue.js:               http://localhost:5173" -ForegroundColor Blue
Write-Host ""
Write-Warning "Credenciales de acceso:"
Write-Host "   MySQL: usuario=sgp_user, password=sgp_pass_2025" -ForegroundColor Yellow
Write-Host "   MongoDB: usuario=rea_admin, password=rea_mongo_2025" -ForegroundColor Yellow
Write-Host "   MinIO: usuario=rea_storage, password=rea_storage_2025" -ForegroundColor Yellow
Write-Host "   Mongo Express: usuario=admin, password=admin" -ForegroundColor Yellow

# Información adicional
Write-Header "📝 PRÓXIMOS PASOS:"
Write-Host "1. Accede a PHPMyAdmin para verificar que las tablas se crearon"
Write-Host "2. Accede a Mongo Express para verificar las colecciones"
Write-Host "3. Ejecuta: npm install en /backend y /frontend"
Write-Host "4. Inicia el desarrollo con: npm run dev"
Write-Host ""
Write-Success "Para detener todos los servicios: $($DockerCompose -replace ' ', ' ') down"
Write-Success "Para ver logs: $($DockerCompose -replace ' ', ' ') logs -f [servicio]"
Write-Success "Para reiniciar: .\quick-start.ps1"

Write-Host ""
Write-Success "🎉 ¡Entorno de desarrollo listo!"

# Abrir URLs automáticamente (opcional)
$openBrowser = Read-Host "`n¿Abrir las interfaces de administración en el navegador? (s/N)"
if ($openBrowser -eq "s" -or $openBrowser -eq "S") {
    Write-Status "Abriendo interfaces de administración..."
    Start-Process "http://localhost:8080"  # PHPMyAdmin
    Start-Process "http://localhost:8081"  # Mongo Express
    Start-Process "http://localhost:9001"  # MinIO
}

Write-Host "`nPresiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")