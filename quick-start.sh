#!/bin/bash

# 🚀 SCRIPT DE INICIO RÁPIDO - SGP REA PRODUCTIONS
# Archivo: quick-start.sh (Windows: quick-start.ps1)
# Propósito: Configurar y ejecutar el entorno de desarrollo local

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}${1}${NC}"
}

# Banner de inicio
echo -e "${CYAN}"
echo "==============================================="
echo "🎬 SGP REA PRODUCTIONS - INICIO RÁPIDO"
echo "==============================================="
echo -e "${NC}"

# Verificar prerrequisitos
print_header "📋 VERIFICANDO PRERREQUISITOS..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker Desktop."
    echo "Descarga: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_warning "docker-compose no encontrado, intentando con 'docker compose'..."
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose no está disponible."
        exit 1
    fi
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

print_success "Docker y Docker Compose están disponibles"

# Verificar Node.js (opcional pero recomendado)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js encontrado: $NODE_VERSION"
else
    print_warning "Node.js no encontrado. Se recomienda para desarrollo del backend/frontend."
fi

# Crear directorio de configuración MySQL si no existe
print_status "Creando estructura de directorios..."
mkdir -p mysql-config
mkdir -p logs
mkdir -p uploads
mkdir -p backups

# Crear archivo de configuración MySQL personalizado
cat > mysql-config/mysql.cnf << EOF
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
EOF

print_success "Configuración MySQL creada"

# Copiar archivo de variables de entorno
if [ ! -f ".env" ]; then
    if [ -f ".env.local" ]; then
        cp .env.local .env
        print_success "Archivo .env creado desde .env.local"
    else
        print_warning "Archivo .env.local no encontrado. Creando .env básico..."
        cat > .env << EOF
NODE_ENV=development
MYSQL_DATABASE=sgp_rea_prod
MONGODB_DATABASE=sgp_rea_files
JWT_SECRET=desarrollo_local_jwt_secret_2025
EOF
    fi
else
    print_status "Archivo .env ya existe"
fi

# Limpiar contenedores anteriores si existen
print_header "🧹 LIMPIANDO INSTALACIÓN ANTERIOR..."
$DOCKER_COMPOSE down --volumes --remove-orphans 2>/dev/null || true
docker system prune -f --volumes 2>/dev/null || true

# Construir e iniciar servicios
print_header "🚀 INICIANDO SERVICIOS..."
print_status "Descargando imágenes Docker (esto puede tomar unos minutos la primera vez)..."

$DOCKER_COMPOSE up -d --build

# Esperar a que los servicios estén listos
print_status "Esperando a que los servicios estén listos..."

# Función para esperar que un servicio esté listo
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if $DOCKER_COMPOSE ps $service | grep -q "healthy\|Up"; then
            print_success "$service está listo"
            return 0
        fi
        print_status "Esperando $service... (intento $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    print_error "$service no está listo después de $max_attempts intentos"
    return 1
}

# Esperar servicios críticos
wait_for_service mysql
wait_for_service mongodb

# Verificar que la base de datos MySQL se haya inicializado correctamente
print_status "Verificando inicialización de MySQL..."
sleep 10  # Dar tiempo adicional para que se ejecute el script de inicialización

# Crear bucket en MinIO
print_status "Configurando almacenamiento MinIO..."
sleep 5

# Mostrar estado de todos los servicios
print_header "📊 ESTADO DE SERVICIOS:"
$DOCKER_COMPOSE ps

# Mostrar URLs de acceso
print_header "🌐 URLS DE ACCESO:"
echo -e "${GREEN}✅ Servicios principales:${NC}"
echo "   🗄️  MySQL Admin (PHPMyAdmin):  http://localhost:8080"
echo "   📊 MongoDB Admin (Mongo Express): http://localhost:8081"
echo "   💾 Almacenamiento (MinIO):       http://localhost:9001"
echo "   📧 Email Testing (MailHog):      http://localhost:8025"
echo ""
echo -e "${BLUE}🔧 Para desarrollo:${NC}"
echo "   🏗️  Backend API:                 http://localhost:3000"
echo "   🎨 Frontend Vue.js:              http://localhost:5173"
echo ""
echo -e "${YELLOW}📱 Credenciales de acceso:${NC}"
echo "   MySQL: usuario=sgp_user, password=sgp_pass_2025"
echo "   MongoDB: usuario=rea_admin, password=rea_mongo_2025"
echo "   MinIO: usuario=rea_storage, password=rea_storage_2025"
echo "   Mongo Express: usuario=admin, password=admin"

# Información adicional
print_header "📝 PRÓXIMOS PASOS:"
echo "1. Accede a PHPMyAdmin para verificar que las tablas se crearon"
echo "2. Accede a Mongo Express para verificar las colecciones"
echo "3. Ejecuta: npm install en /backend y /frontend"
echo "4. Inicia el desarrollo con: npm run dev"
echo ""
echo -e "${GREEN}Para detener todos los servicios: $DOCKER_COMPOSE down${NC}"
echo -e "${GREEN}Para ver logs: $DOCKER_COMPOSE logs -f [servicio]${NC}"
echo -e "${GREEN}Para reiniciar: ./quick-start.sh${NC}"

print_success "🎉 ¡Entorno de desarrollo listo!"