# 🗄️ SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
# Archivo: init-database.ps1
# Propósito: Ejecutar los scripts de inicialización de MySQL y MongoDB

param(
    [switch]$MySQLOnly = $false,
    [switch]$MongoOnly = $false
)

$Colors = @{
    Green  = "Green"
    Yellow = "Yellow"
    Red    = "Red"
    Blue   = "Blue"
    Cyan   = "Cyan"
}

function Write-Status { param([string]$Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param([string]$Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Error { param([string]$Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Warning { param([string]$Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }

Write-Host "`n🗄️ INICIALIZANDO BASES DE DATOS..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Verificar que Docker esté corriendo
Write-Status "Verificando servicios Docker..."
try {
    $dockerPS = docker-compose ps 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose no está corriendo"
    }
    Write-Success "Servicios Docker están corriendo"
} catch {
    Write-Error "Los servicios Docker no están corriendo. Ejecuta: .\quick-start.ps1"
    exit 1
}

# Inicializar MySQL
if (-not $MongoOnly) {
    Write-Status "Inicializando MySQL..."
    
    # Verificar que el archivo existe
    if (-not (Test-Path "database_setup_mysql.sql")) {
        Write-Error "Archivo database_setup_mysql.sql no encontrado"
        exit 1
    }
    
    Write-Status "Ejecutando script de MySQL (esto puede tomar unos minutos)..."
    
    try {
        # Usar docker exec con PowerShell para ejecutar el script
        $mysqlScript = Get-Content "database_setup_mysql.sql" -Raw
        $mysqlScript | docker exec -i sgp_mysql mysql -u sgp_user -psgp_pass_2025 sgp_rea_prod
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Script de MySQL ejecutado exitosamente"
            
            # Verificar que las tablas se crearon
            $tableCount = 'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = "sgp_rea_prod";' | docker exec -i sgp_mysql mysql -u sgp_user -psgp_pass_2025 -N sgp_rea_prod
            Write-Success "Tablas creadas en MySQL: $tableCount"
        } else {
            throw "Error ejecutando script MySQL"
        }
    } catch {
        Write-Error "Error al ejecutar script de MySQL: $($_.Exception.Message)"
        Write-Warning "Puedes ejecutar manualmente desde PHPMyAdmin: http://localhost:8080"
        Write-Warning "1. Seleccionar base de datos 'sgp_rea_prod'"
        Write-Warning "2. Ir a pestaña 'SQL'"
        Write-Warning "3. Copiar contenido de database_setup_mysql.sql"
        Write-Warning "4. Ejecutar"
    }
}

# Inicializar MongoDB
if (-not $MySQLOnly) {
    Write-Status "Inicializando MongoDB..."
    
    # Verificar que el archivo existe
    if (-not (Test-Path "database_setup_mongodb.js")) {
        Write-Error "Archivo database_setup_mongodb.js no encontrado"
        exit 1
    }
    
    Write-Status "Ejecutando script de MongoDB..."
    
    try {
        # Usar docker exec para ejecutar el script de MongoDB
        Get-Content "database_setup_mongodb.js" -Raw | docker exec -i sgp_mongodb mongosh sgp_rea_files -u rea_admin -p rea_mongo_2025 --authenticationDatabase admin
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Script de MongoDB ejecutado exitosamente"
            
            # Verificar colecciones creadas
            Write-Status "Verificando colecciones en MongoDB..."
            $collections = 'db.getCollectionNames()' | docker exec -i sgp_mongodb mongosh sgp_rea_files -u rea_admin -p rea_mongo_2025 --authenticationDatabase admin --quiet
            Write-Success "MongoDB inicializado correctamente"
        } else {
            throw "Error ejecutando script MongoDB"
        }
    } catch {
        Write-Error "Error al ejecutar script de MongoDB: $($_.Exception.Message)"
        Write-Warning "Puedes ejecutar manualmente desde Mongo Express: http://localhost:8081"
        Write-Warning "1. Seleccionar base de datos 'sgp_rea_files'"
        Write-Warning "2. Usar consola para ejecutar comandos del archivo database_setup_mongodb.js"
    }
}

Write-Host "`n✅ INICIALIZACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Accede a las interfaces de administración:" -ForegroundColor Yellow
Write-Host "📊 MySQL (PHPMyAdmin):    http://localhost:8080" -ForegroundColor Green
Write-Host "📊 MongoDB (Mongo Express): http://localhost:8081" -ForegroundColor Green
Write-Host "`nCredenciales:" -ForegroundColor Yellow
Write-Host "MySQL: sgp_user / sgp_pass_2025" -ForegroundColor White
Write-Host "MongoDB: rea_admin / rea_mongo_2025" -ForegroundColor White

Write-Host "`n🚀 Próximo paso: Crear el backend API con Node.js" -ForegroundColor Cyan